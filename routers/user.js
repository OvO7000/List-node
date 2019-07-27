const express = require('express')
const User = require('../controllers/user')

const router = express.Router()

router.route('/login').post(User.login)


module.exports = router