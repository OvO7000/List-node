const typeRouter =require('./type')

module.exports = app => {
    app.use('/api/type', typeRouter)
}