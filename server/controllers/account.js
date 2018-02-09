const { mysql } = require('../qcloud')

async function add(ctx, next) {

  const userinfo = ctx.state.$wxInfo.userinfo,
    open_id = userinfo && userinfo['open_id'];

  if (open_id) {
    const params = ctx.request.body;
    // const data = await mysql('cflowMoney').insert({ 
    //   open_id: open_id
    // })
    // ctx.state.data = {
      
    // }
    ctx.state.status = 'success'
  } else {
    ctx.state.code = -1
  }
}

async function getTotal(ctx, next) {

}

module.exports = {
  add,
  getTotal
}