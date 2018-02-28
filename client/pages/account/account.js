//logs.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var Promise = require('../../plugins/es6-promise.min.js').Promise
import * as util from '../../utils/util.js'

const app = getApp();
// 将微信的请求方法，转变成返回promise的请求方法
const pRequest = util.wxPromisify(qcloud.request)

Page({
  data: {
    total: 0,
    account: 0,
    income: 0,
    defray: 0,
    amount: 0,
    userInfo: {},
    logged: false,
    isFirst: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    wx.showToast({ title: '正在加载', icon: 'loading' })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        logged: true
      });
      this.getAccount()
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = () => {
        this.setData({
          userInfo: app.globalData.userInfo,
          logged: true
        });
        this.getAccount()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      this.login();
    }
  },
  onShow() {
    if (this.data.isFirst) {
      this.setData({
        isFirst: false
      });

    } else {
      // 使返回到首页的时候，依然请求数据
      wx.showToast({ title: '正在加载', icon: 'loading' })
      this.getAccount()
    }
  },
  login: function () {
    app.login(() => {
      this.setData({
        userInfo: app.globalData.userInfo,
        logged: true
      });
      this.getAccount();
    });
  },
  getAccount() {
    var that = this;
    Promise.all([
      pRequest({
        url: `${config.service.accountUrl}/getAccount`,
        method: "POST",
        logged: true,
        data: { date: this.data.queryDate }
      }),
      pRequest({
        url: `${config.service.wishUrl}/getAmount`,
        method: "POST",
        logged: true
      })
    ]).then(([account, amount]) => {
      if (account.data.code != 1 || amount.data.code != 1) return util.showModel('查询失败', result);

      that.setData(Object.assign({}, account.data.data, amount.data.data));
      wx.hideLoading();

      // 记录可用金额到全局
      app.globalData.usable = account.data.data.account

    }).catch(error => {
      util.showModel('查询失败', error)
    })
  },
  showTip() {
    util.showModel('还未登录', "您需要先登录，才能进行操作。点击顶部头像登录吧。")
  }
})
