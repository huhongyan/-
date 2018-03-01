var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
import * as util from '../../utils/util.js'

Page({
  data: {
    type: 1,
    categorys: [],
    // 选中类别的下标
    categoryIndex: 0,
    date: util.formatTime(new Date),
    describe: ""
  },
  categorys: {},
  onLoad: function () {
    var that = this;
    qcloud.request({
      url: `${config.service.accountUrl}/getCategorys`,
      login: true,
      method: "POST",
      data: { date: this.data.queryDate },
      success(result) {
        var categorys = result.data.data || {};
        that.setData({
          categorys: that.data.type ? categorys.income : categorys.defray
        })
        that.categorys = categorys
      },
      fail(error) {
        util.showModel('查询失败', error)
      }
    })
  },
  // 提交表单
  formsubmit(e) {
    let params = e.detail.value,
      account = params.account;
    if (account && account.match(/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/)) {
      wx.showToast({
        title: '正在保存',
        icon: 'loading',
        mask: true
      })
      qcloud.request({
        url: `${config.service.accountUrl}/add`,
        login: true,
        method: "POST",
        data: params,
        success(result) {
          if (result.data.code != 1) return util.showModel('操作失败', result)
          util.showSuccess('保存成功!');
          wx.redirectTo({
            url: '../listAccount/listAccount',
          })
        },
        fail(error) {
          util.showModel('操作失败', error)
        }
      })
    } else
      util.showModel('操作失败', '请输入正确的金额！')

  },
  // 切换收入/支出
  switchTypeChange(e) {
    var _type = Number(e.detail.value) || 0;
    this.setData({
      type: _type,
      categorys: _type ? this.categorys.income : this.categorys.defray
    })
  },
  // 各种下拉的change事件回调
  bindChange(e) {
    let key = e.target.dataset["key"],
      data = {};
    data[key] = e.detail.value;
    this.setData(data)
  }
})
