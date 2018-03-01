// pages/addWish/addWish.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
import * as util from '../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  formsubmit(e) {
    let params = e.detail.value,
      title = params.title,
      total = params.total;
    if (!title)
      return util.showModel('操作失败', '请输入心愿卡标题！')

    if (total && total.match(/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/)) {
      wx.showToast({
        title: '正在保存',
        icon: 'loading',
        mask: true
      });
      params['imgUrl'] = this.data.imgUrl
      qcloud.request({
        url: `${config.service.wishUrl}/add`,
        login: true,
        method: "POST",
        data: params,
        success(result) {
          if (result.data.code != 1) return util.showModel('操作失败', result)
          util.showSuccess('保存成功!');
          // wx.navigateBack(1)
          wx.redirectTo({
            url: '../wish/wish'
          })
        },
        fail(error) {
          util.showModel('操作失败', error)
        }
      })
    } else
      util.showModel('操作失败', '请输入正确的金额！')
  },

  // 上传图片接口
  doUpload: function () {
    var that = this

    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        util.showBusy('正在上传')
        var filePath = res.tempFilePaths[0]
        // 上传图片
        wx.uploadFile({
          url: config.service.uploadUrl,
          filePath: filePath,
          name: 'file',
          success: function (res) {
            debugger
            util.showSuccess('上传图片成功')
            res = JSON.parse(res.data)
            that.setData({
              imgUrl: res.data.imgUrl
            })
          },
          fail: function (e) {
            util.showModel('上传图片失败')
          }
        })

      },
      fail: function (e) {
        console.error(e)
        util.showModel('上传图片失败', e)
      }
    })
  },
  // 预览图片
  previewImg: function () {
    wx.previewImage({
      current: this.data.imgUrl,
      urls: [this.data.imgUrl]
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