const path  = require('path')

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
        size: 2097152,
        path: {
            upload: 'assets/upload/',
            work: 'assets/imgs/work',
            figure: 'assets/imgs/figure',
        },
        length: 20
    }
}

module.exports = config