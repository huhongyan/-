//logs.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
import * as util from '../../utils/util.js'

const app = getApp();

Page({
  data: {
    userInfo: {},
    logged: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        logged: true
      })
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = () => {
        this.setData({
          userInfo: app.globalData.userInfo,
          logged: true
        })
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
      })
    });
  },
  showTip(){
    util.showModel('还未登录', "您需要先登录，才能进行操作。点击顶部头像登录吧。")
  }
})
