//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
var util = require('./utils/util.js')

App({
  globalData: {
    userInfo: null
  },
  /**
   * 用户登录(调出授权弹框)
   * 登录成功之后，将用户信息存放到globalData中
   * callback回调，用于其他page调用登录之后做处理
   * isDefault 是否默认登录，这时候，不展示提示
   */
  login: function (callback, isDefault) {
    !isDefault && util.showBusy('正在登录')
    var that = this;
    // 调用登录接口
    qcloud.login({
      success(result) {
        if (result) {
          !isDefault && util.showSuccess('登录成功');
          that.globalData.userInfo = result;
          callback && callback();
        } else {
          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          qcloud.request({
            url: config.service.requestUrl,
            login: true,
            success(result) {
              !isDefault && util.showSuccess('登录成功')
              that.globalData.userInfo = result.data.data;
              callback && callback();
            },
            fail(error) {
              util.showModel('请求失败', error)
              console.log('request fail', error)
            }
          })
        }
      },

      fail(error) {
        if (error.detail.errMsg == 'getUserInfo:fail auth deny'){
          util.showModel('无法完成登录', '需要获取你的用户资料，用于登录。请重试登录，并确保允许小程序获取用户资料。')
        }else{
          util.showModel('登录失败', error)
        }
        console.log('登录失败', error)
      }
    })
  },
  onLaunch: function () {
    qcloud.setLoginUrl(config.service.loginUrl);
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权
          // 登录
          this.login(() => {
              // 由于是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback()
              }
            }
          , true)
        }
      }
    })
  }
})