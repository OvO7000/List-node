const typeRouter =require('./type')
const workRouter =require('./work')

module.exports = app => {
    app.use('/api/type', typeRouter)
    app.use('/api/work', workRouter)
}