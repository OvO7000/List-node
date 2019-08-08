const express = require('express')
const Sub = require('../controllers/sub')

const router = express.Router()

router.route('/add').post(Sub.add)
router.route('/del').post(Sub.del)
router.route('/index').get(Sub.index)
router.route('/single/:id').get(Sub.single)

module.exports = router