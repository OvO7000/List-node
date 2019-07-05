const express = require('express')
const Work = require('../controllers/work')

const router = express.Router()

router.route('/add').post(Work.add)
router.route('/index').get(Work.index)

module.exports = router