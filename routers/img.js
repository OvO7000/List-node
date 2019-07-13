const express = require('express')
const Img = require('../controllers/img')
const upload = require('../middlewares/upload')

const router = express.Router()

router.route('/adds').post(upload.array('imgs'), Img.adds)
router.route('/del/:id').delete(Img.del)
router.route('/edit/:id').patch(upload.single('img'), Img.edit)
router.route('/add').post(upload.single('img'), Img.add)

module.exports = router