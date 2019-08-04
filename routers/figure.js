const express = require('express')
const Figure = require('../controllers/figure')

const router = express.Router()

router.route('/add').post(Figure.add)
router.route('/edit/:id').patch(Figure.edit)
router.route('/del/:id').delete(Figure.del)
router.route('/index').get(Figure.index)
router.route('/query').get(Figure.query)
router.route('/single/:id').get(Figure.single)

module.exports = router