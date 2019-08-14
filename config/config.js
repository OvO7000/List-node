const path = require('path')

const config = {
  port: '8080',
  size: {
    // 3M
    req: 10 * 1024 * 1024
  },
  pagination: 10,
  tag: ['alert', 'not perfect complete', 'rotten', 'serials'],
  path: {
    root: '/app/list-node',
  },
  img: {
    // 2M, 2*1024*1024
    size: 10 * 1024 * 1024,
    path: {
      upload: 'assets/upload/',
      work: 'assets/imgs/work',
      figure: 'assets/imgs/figure',
      all: 'assets/imgs'
    },
    length: 20
  },
  url: {
    app: 'http://list.ovo7.cn',
    img: 'http://img.list.ovo7.cn'
  },
  saltRounds: 10,
  expireTime: 20 * 60 * 60,
  tinify: {
    key: 'ZRkGzcKlfPc56bddggfB7B8HFRw5Nsd6'
  }
}

module.exports = config