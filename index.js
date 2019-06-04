const express = require('express')
const config = require('./config/config')
const router =require('./routers')

const app = express()

app.listen(config.port, () => {
    console.log('list-node listening on ' + config.port);
})

router(app)





