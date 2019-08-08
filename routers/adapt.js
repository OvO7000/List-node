const express = require('express')
const Adapt = require('../controllers/adapt')

const router = express.Router()

router.route('/query').get(Adapt.query)
router.route('/exist').get(Adapt.exist)

module.exports = router