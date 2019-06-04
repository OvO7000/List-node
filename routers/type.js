const express = require('express')
const Type = require('../controllers/type')

const router = express.Router()

router.route('/index')
    .get(Type.index)

module.exports = router