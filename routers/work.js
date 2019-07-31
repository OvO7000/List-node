const express = require('express')
const Work = require('../controllers/work')

const router = express.Router()

router.route('/add').post(Work.add)
router.route('/edit/:id').patch(Work.edit)
router.route('/index').get(Work.index)
router.route('/del/:id').delete(Work.del)
router.route('/single/:id').get(Work.single)

module.exports = router