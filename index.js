const express = require('express')
const config = require('./config/config')
var bodyParser = require('body-parser')
const router = require('./routers')
const error = require('./middlewares/error')
const jwt = require('./middlewares/jwt')

const app = express()

app.use(bodyParser.json({
    limit: config.size.req
}))
app.use(bodyParser.urlencoded({
    limit: config.size.req
}))
app.use(jwt)


router(app)

app.use(error)

app.listen(config.port, () => {
    console.log('list-node listening on ' + config.port);
})






