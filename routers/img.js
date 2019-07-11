const express = require('express')
const Img = require('../controllers/img')
const upload = require('../middlewares/upload')

const router = express.Router()

router.route('/add').post(upload.array('imgs'), Img.addWorkImgs)
router.route('/del/:id').delete(Img.del)

module.exports = router