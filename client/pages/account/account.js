//logs.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
import * as util from '../../utils/util.js'

const app = getApp();

Page({
  data: {
    total: 0,
    account: 0,
    income: 0,
    defray: 0,
    userInfo: {},
    logged: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    wx.showToast({title: '正在加载', icon: 'loading'})
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
  login: function () {
    app.login(() => {
      this.setData({
        userInfo: app.globalData.userInfo,
        logged: true
      });
      this.getAccount();
    });
  },
  getAccount(){
    var that = this;
    qcloud.request({
      url: `${config.service.accountUrl}/getAccount`,
      login: true,
      method: "POST",
      data: { date: this.data.queryDate },
      success(result) {
        if (result.data.code != 1) return util.showModel('查询失败', result);
       
        that.setData(result.data.data);
        wx.hideLoading()
      },
      fail(error) {
        util.showModel('查询失败', error)
      }
    })
  },
  showTip(){
    util.showModel('还未登录', "您需要先登录，才能进行操作。点击顶部头像登录吧。")
  }
})
