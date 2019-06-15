const express = require('express')
const Work = require('../controllers/work')

const router = express.Router()

router.route('/add')
    .post(Work.add)

module.exports = router