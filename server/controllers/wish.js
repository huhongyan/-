const { mysql } = require('../qcloud')
const debug = require('debug')('koa-weapp-demo')

async function add(ctx, next) {

  const userinfo = ctx.state.$wxInfo.userinfo,
    openId = userinfo && userinfo['openId'];

  if (openId) {

    const params = ctx.request.body;
    params['open_id'] = openId;

    await mysql('cWish').insert(params).then(function (resp) {
      ctx.state.data = {
        id: resp[0]
      }
      ctx.state.code = 1
    }).catch(function (err) {
      ctx.state.code = -1
      debug('Catch Error: %o', err)
    });

  } else {
    ctx.state.code = -1
  }
}

async function getList(ctx, next) {
  const userinfo = ctx.state.$wxInfo.userinfo,
    openId = userinfo && userinfo['openId'];

  if (openId) {

    let list = await mysql('cWish').select().where({ 'open_id': openId, isCompleted: false }).orderBy('create_time', 'desc');

    ctx.state.code = 1;
    ctx.state.data = list;

  } else {
    ctx.state.code = -1;
    ctx.state.message = "账号未登录";
  }
}

async function getWish(ctx, next) {
  const params = ctx.request.body;
  await mysql('cWish').select().where(params).then(([resp]) => {
    if (!resp) {
      ctx.state.code = -1;
      ctx.state.message = "未查询到数据";
    }

    ctx.state.code = 1;
    ctx.state.data = resp;

  }).catch(function (err) {
    ctx.state.code = -1
    debug('Catch Error: %o', err)
  });

}

async function getAmount(ctx, next) {
  const userinfo = ctx.state.$wxInfo.userinfo,
    openId = userinfo && userinfo['openId'];

  if (openId) {

    let count = await mysql('cWish').count().where({ 'open_id': openId, isCompleted: false });

    ctx.state.code = 1;
    ctx.state.data = { amount: count[0]['count(*)'] };

  } else {
    ctx.state.code = -1;
    ctx.state.message = "账号未登录";
  }

}


async function updateAccount(ctx, next) {
  const params = ctx.request.body,
    id = params.id,
    account = Number(params.account) || 0,
    isAdd = !!Number(params.type);

  if (id) {

    var num;
    await mysql.transaction(function (trx) {
      return mysql('cWish').transacting(trx).select('account', 'total').where({ id })
        .then(([resp]) => {
          if (!resp) throw new Error('参数错误！')

          num = resp.account;
          if (isAdd) {
            num = Math.round(num * 100 + account * 100) / 100;
            if (num > resp.total) throw new Error('传入数据过大！')

          } else {
            num = Math.round(num * 100 - account * 100) / 100
            if (num < 0) throw new Error('传入数据过大！')
          }

          return mysql('cWish').transacting(trx).where({ id }).update({ account: num })
            .then(trx.commit)
            .catch(trx.rollback);
        }).then(trx.commit)
        .catch(trx.rollback);
    }).then(() => {
      ctx.state.code = 1;
      ctx.state.data = num;
      console.log('Transaction complete.');
    }).catch(function (err) {
      ctx.state.code = -1
      debug('Catch Error: %o', err)
    });

  } else {
    ctx.state.code = -1;
    ctx.state.message = "参数错误！";
  }

}


async function close(ctx, next) {
  const params = ctx.request.body,
    id = params.id,
    userinfo = ctx.state.$wxInfo.userinfo,
    openId = userinfo && userinfo['openId'];

  if (openId && id) {
    var account;
    await mysql.transaction(function (trx) {
      return mysql('cWish').transacting(trx).select('account', 'total', 'title').where({ id })
        .then(([wish]) => {
          account = wish.account;
          if (!wish) throw new Error('参数错误！')
          if (account !== wish.total) throw new Error('资金不够，不能关闭！')
          return mysql('cWish').transacting(trx).where({ id }).update({ isCompleted: true })
            .then(() => {
              const date = new Date,
                year = date.getFullYear(),
                month = date.getMonth(),
                // 是否收入
                isIncome = false;
              account = Number(account) || 0;
              return mysql('cCensusAccount').transacting(trx).select('id', 'account', 'income', 'defray').where({ year, month, 'open_id': openId })
                .then(([resp]) => {
                  var d = date.getDate();
                  var params = {
                    open_id: openId,
                    type: 0,
                    account,
                    date: `${year}-${month >= 9 ? (month + 1) : '0' + (month + 1)}-${d > 9 ? d : '0' + d}`,
                    category: '完成心愿卡',
                    describe: wish.title
                  }
                  if (!resp) return mysql('cCensusAccount').transacting(trx).insert({
                    year,
                    month,
                    open_id: openId,
                    account,
                    income: 0,
                    defray: account
                  }).then(([id]) => {
                    params['census_id'] = id
                    return mysql('cflowMoney').transacting(trx).insert(params)
                      .then(trx.commit)
                      .catch(trx.rollback);
                  }).catch(trx.rollback);

                  var census_id = resp.id,
                    _account = Number(resp.account) || 0,
                    income = Number(resp.income) || 0,
                    defray = Math.round(account * 100 + (Number(resp.defray) || 0) * 100) / 100;

                  _account = Math.round(income * 100 - defray * 100) / 100;

                  params['census_id'] = census_id;
                  return Promise.all([
                    mysql('cCensusAccount').transacting(trx).where({
                      'id': census_id
                    }).update({
                      year,
                      month,
                      account: _account,
                      income,
                      defray
                    }),
                    mysql('cflowMoney').transacting(trx).insert(params)
                  ]).then(trx.commit)
                    .catch(trx.rollback);
                }).then(trx.commit)
                .catch(trx.rollback);

            }).then(trx.commit)
            .catch(trx.rollback);
        }).then(trx.commit)
        .catch(trx.rollback);
    }).then(() => {
      ctx.state.code = 1;
      console.log('Transaction complete.');
    }).catch(function (err) {
      ctx.state.code = -1
      debug('Catch Error: %o', err)
    });

  } else {
    ctx.state.code = -1;
    ctx.state.message = "参数错误！";
  }

}


async function delWish(ctx, next) {
  const params = ctx.request.body;

  if (params.id) {

    params['isCompleted'] = false;
    await mysql('cWish').where(params).del()
     
    ctx.state.code = 1;
  } else {
    ctx.state.code = -1;
    ctx.state.message = "参数错误！";
  }
}

module.exports = {
  add,
  getList,
  getWish,
  getAmount,
  updateAccount,
  close,
  delWish
}