var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
import * as util from '../../utils/util.js'

const app = getApp();

Page({
  data: {
    cards: [],
    usable: 0
  },
  onLoad: function () {
    this.refreshList()
  },
  refreshList(){
    wx.showToast({ title: '正在加载', icon: 'loading' })
    var that = this;
    qcloud.request({
      url: `${config.service.wishUrl}/getList`,
      login: true,
      method: "POST",
      success(result) {
        if (result.data.code != 1) return util.showModel('查询失败', result);

        that.setData({ cards: result.data.data, usable: app.globalData.usable });
        wx.hideLoading()
      },
      fail(error) {
        util.showModel('查询失败', error)
      }
    })
  },
  onShow(){

  }
})
