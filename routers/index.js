const typeRouter =require('./type')
const workRouter =require('./work')
const imgRouter =require('./img')
const subRouter =require('./sub')

module.exports = app => {
    app.use('/api/type', typeRouter)
    app.use('/api/work', workRouter)
    app.use('/api/img', imgRouter)
    app.use('/api/sub', subRouter)
}