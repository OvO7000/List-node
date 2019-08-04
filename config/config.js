const path = require('path')

const config = {
  port: '8080',
  size: {
    // 3M
    req: 3145728
  },
  pagination: 10,
  tag: ['alert', 'not perfect complete', 'rotten', 'serials'],
  path: {
    root: '/app/list-node',
  },
  img: {
    // 2M, 2*1024*1024
    size: 2 * 1024 * 1024,
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
  expireTime: 20 * 60 * 60
}

module.exports = config