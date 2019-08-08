const typeRouter = require('./type')
const workRouter = require('./work')
const imgRouter = require('./img')
const subRouter = require('./sub')
const figureRouter = require('./figure')
const userRouter = require('./user')
const adaptRouter = require('./adapt')

module.exports = app => {
  app.use('/api/type', typeRouter)
  app.use('/api/work', workRouter)
  app.use('/api/img', imgRouter)
  app.use('/api/sub', subRouter)
  app.use('/api/figure', figureRouter)
  app.use('/api/user', userRouter)
  app.use('/api/adapt', adaptRouter)
}