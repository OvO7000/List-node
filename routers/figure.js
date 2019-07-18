const express = require('express')
const Figure = require('../controllers/figure')

const router = express.Router()

router.route('/add').post(Figure.add)
router.route('/del/:id').delete(Figure.del)
router.route('/index').get(Figure.index)

module.exports = router