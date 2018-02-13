//logs.js
// const util = require('../../utils/util.js')
import * as util from '../../utils/util.js'

Page({
  data: {
    cards: [{
      id: 1,
      title: '去旅行',
      describe: '我想要去完成一次旅行',
      imgUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1518530090321&di=e06b698b1e47ad9819801990768035a0&imgtype=0&src=http%3A%2F%2Fb.hiphotos.baidu.com%2Fzhidao%2Fwh%253D450%252C600%2Fsign%3D3de411617dcb0a468577833d5e53da12%2F0b55b319ebc4b74572be448dc9fc1e178a821506.jpg',
      total: 2000,
      account: 800
    }, {
      id: 2,
      title: '买漂亮衣服',
      describe: '想要买一件漂亮并且非常昂贵的衣服',
      total: 2000,
      account: 1600
    }]
  },
  onLoad: function () {

  }
})
