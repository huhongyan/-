//logs.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
import * as util from '../../utils/util.js'

Page({
  data: {
    type: 1,
    categorys: [{
      id: 0,
      type: 1,
      name: "工资",
      describe: ""
    }, {
      id: 1,
      type: 1,
      name: "红包",
      describe: ""
    }],
    // 选中类别的下标
    categoryIndex: 0,
    date: util.formatTime(new Date),
    describe: ""
  },
  onLoad: function () {
    // 获取类别list
  },
  // 提交表单
  formsubmit(e) {
    let params = e.detail.value;

    // TODO 对数据做判断

    // TODO 提交表单
    qcloud.request({
      url: config.service.addAccountUrl,
      login: true,
      method: "POST",
      data: params,
      success(result) {
        util.showSuccess(result.data.data.msg || '数据有误')
      },
      fail(error) {
        util.showModel('请求失败', error)
      }
    })
  },
  // 切换收入/支出
  switchTypeChange(e){
    this.setData({
      type: Number(e.detail.value) || 0
    })

    // TODO 获取类别list
  },
  // 各种下拉的change事件回调
  bindChange(e) {
    let key = e.target.dataset["key"],
      data = {};
    data[key] = e.detail.value;
    this.setData(data)
  }
})
