
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
import * as util from '../../utils/util.js'

Component({
  properties: {
    card: {
      type: Object,
      value: {},
    },
    usable: {
      type: Number,
      value: 0
    }
  },
  data: {
    isEdit: false,
    need: 0,
    type: 1
  },
  attached() {
    this.setData({
      need: Math.round(this.data.card.total * 100 - this.data.card.account * 100) / 100
    })
  },
  methods: {
    switchTypeChange(e) {
      var _type = Number(e.detail.value) || 0;
      this.setData({
        type: _type
      })
    },
    changeAccount() {
      this.setData({
        isEdit: true
      })
    },
    delCard() {
      var that = this;
      wx.showActionSheet({
        itemList: ['删除心愿卡'],
        success: function (res) {
          qcloud.request({
            url: `${config.service.wishUrl}/delWish`,
            method: "POST",
            data: { id: that.data.card.id },
            success(result) {
              if (result.data.code != 1) return util.showModel('操作失败', result)
              util.showSuccess('操作成功!');
              that.triggerEvent('refreshlist', {})
            },
            fail(error) {
              util.showModel('操作失败', error)
            }
          })
        },
        fail: function (res) {
          console.log('操作失败', res.errMsg)
        }
      })
    },
    sliderAchange(e) {
      let params = e.detail.value,
        account = params.account,
        type = Number(params.type) || 0;

      if (account && account.match(/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/)) {
        if (!!type) {
          var max = Math.min(this.data.need, this.data.usable);
        } else {
          var max = this.data.card.account;
        }
        if (account > max) return util.showModel('操作失败', `超过最大可输入金额 ${max}`)
        wx.showToast({
          title: '正在保存',
          icon: 'loading',
          mask: true
        })
        var that = this;
        qcloud.request({
          url: `${config.service.wishUrl}/updateAccount`,
          method: "POST",
          data: Object.assign({ id: that.data.card.id }, params),
          success(result) {
            if (result.data.code != 1) return util.showModel('操作失败', result)
            util.showSuccess('操作成功!');
            that.setData({
              isEdit: false,
              'card.account': result.data.data,
              need: Math.round(that.data.card.total * 100 - result.data.data * 100) / 100
            })
          },
          fail(error) {
            util.showModel('操作失败', error)
          }
        })
      } else util.showModel('操作失败', '请输入正确的金额！')
    },
    cancelChange(event) {
      this.setData({
        isEdit: false
      })
    },
    closeCard() {
      wx.showToast({
        icon: 'loading',
        mask: true
      })
      var that = this;
      qcloud.request({
        url: `${config.service.wishUrl}/close`,
        login: true,
        method: "POST",
        data: Object.assign({ id: this.data.card.id }),
        success(result) {
          if (result.data.code != 1) return util.showModel('操作失败', result)
          util.showSuccess('操作成功!');
          that.triggerEvent('refreshlist', {})
        },
        fail(error) {
          util.showModel('操作失败', error)
        }
      })
    }
  }
})
