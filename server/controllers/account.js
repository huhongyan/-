const { mysql } = require('../qcloud')
const debug = require('debug')('koa-weapp-demo')

async function add(ctx, next) {

  const userinfo = ctx.state.$wxInfo.userinfo,
    openId = userinfo && userinfo['openId'];

  if (openId) {
    const params = ctx.request.body;
    params['open_id'] = openId;

    // 处理日期
    const date = new Date(params.date),
      year = date.getFullYear(),
      month = date.getMonth(),
      // 是否收入
      isIncome = !!(Number(params['type']) || 0),
      account = Number(params['account']) || 0;

    await mysql.transaction(function (trx) {
      mysql('cCensusAccount').transacting(trx).select('id', 'account', 'income', 'defray').where({ year, month })
        .then(([resp]) => {
          // 如果没有数据
          if (!resp) return mysql('cCensusAccount').transacting(trx).insert({
            year,
            month,
            open_id: openId,
            account,
            income: isIncome ? account : 0,
            defray: isIncome ? 0 : account
          }).then(([id]) => {
            params['census_id'] = id
            return mysql('cflowMoney').transacting(trx).insert(params)
              .then(trx.commit)
              .catch(trx.rollback);
          }).catch(trx.rollback);

          var census_id = resp.id,
            _account = Number(resp.account) || 0,
            income = Number(resp.income) || 0,
            defray = Number(resp.defray) || 0;
          // 计算金额
          if (isIncome) {
            income = Math.round(account * 100 + income * 100) / 100;
          } else {
            defray = Math.round(account * 100 + defray * 100) / 100;
          }
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
    }).then(function (resp) {
      ctx.state.data = {
        id: resp[0]
      }
      ctx.state.code = 1
      console.log('Transaction complete.');
    }).catch(function (err) {
      ctx.state.code = -1
      debug('Catch Error: %o', err)
    });

  } else {
    ctx.state.code = -1
  }
}

async function getTotal(ctx, next) {
  const userinfo = ctx.state.$wxInfo.userinfo,
    openId = userinfo && userinfo['openId'],
    date = new Date,
    year = date.getFullYear(),
    month = date.getMonth();

  if (openId) {
    await Promise.all([
      mysql('cCensusAccount').select('income', 'defray').where({ year, month }),
      mysql('cCensusAccount').select('account'),
    ]).then(([[{ income, defray }], list]) => {

      let _account = 0;
      if (list instanceof Array) {
        list.forEach(({ account }) => {
          _account = Math.round(_account * 100 + account * 100)/100
        })
      }
      ctx.state.code = 1;
      ctx.state.data = {
        account: _account,
        total: _account,
        income,
        defray
      };
    }).catch((e) => {
      ctx.state.code = -1;
      ctx.state.message = e;
    })
  } else {
    ctx.state.code = -1;
    ctx.state.message = "账号未登录";
  }
}

async function getList(ctx, next) {
  const userinfo = ctx.state.$wxInfo.userinfo,
    openId = userinfo && userinfo['openId'];

  if (openId) {
    let query = ctx.request.body, date = query && query.date, year, month;
    if (date) {
      date = date && date.match(/\d+/g);
      if (date) {
        year = date[0];
        month = Number(date[1]) - 1;
      }
    }
    if (!year || (!month && month !== 0) || month < 0) {
      date = new Date;
      year = date.getFullYear();
      month = date.getMonth()
    }

    let census = await mysql('cCensusAccount').select('id', 'account', 'income', 'defray').where({ year, month }).orderBy('create_time'),
      data = {
        list: [],
        total: 0,
        income: 0,
        defray: 0
      };

    if (census.length) {
      census = census[0];
      data.list = await mysql('cflowMoney').select().where({ 'census_id': census.id });
      data.total = census.account;
      data.income = census.income;
      data.defray = census.defray;
    }

    ctx.state.code = 1;
    ctx.state.data = data;

  } else {
    ctx.state.code = -1;
    ctx.state.message = "账号未登录";
  }
}

async function getCategorys(ctx, next) { 
  await Promise.all([
    mysql('cCategory').select().where({ type: 1 }),
    mysql('cCategory').select().where({ type: 0 })
  ]).then(([income, defray]) => {
    ctx.state.code = 1;
    ctx.state.data = {
      income,
      defray
    };
  }).catch((e) => {
    ctx.state.code = -1;
    ctx.state.message = e;
  })
}

module.exports = {
  add,
  getTotal,
  getList,
  getCategorys
}