// pages/listAccount/listAccount.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
import * as util from '../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    queryDate: util.formatTime(new Date),
    querying: true,
    list: [],
    total: 0,
    defray: 0,
    income: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
  },

  bindchangeTime(e) {
    this.setData({
      queryDate: e.detail.value,
      querying: true
    });
    this.getList()
  },

  getList(){
    // util.showBusy('正在加载数据');
    let that = this;
    qcloud.request({
      url: `${config.service.accountUrl}/getList`,
      login: true,
      method: "POST",
      data: { date: this.data.queryDate },
      success(result) {
        if (result.data.code != 1) return util.showModel('查询失败', result);
        that.setData(Object.assign({}, result.data.data, { querying: false}))
       
      },
      fail(error) {
        util.showModel('查询失败', error)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})