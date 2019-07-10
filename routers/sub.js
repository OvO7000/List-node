const express = require('express')
const Sub = require('../controllers/sub')

const router = express.Router()

router.route('/add').post(Sub.add)
router.route('/del').post(Sub.del)

module.exports = router