const multer  = require('multer')
const config  = require('../config/config')
const path  = require('path')


// const upload = config.path.root + config.path.img.upload
const upload = path.resolve(config.img.path.upload)
const fileSize = config.img.size
const files = config.img.length

const storage = multer.diskStorage({
    destination: upload,
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const limits = {
    fileSize: fileSize,
    files: files
}

function fileFilter (req, file, cb) {
    if(file.mimetype === 'image/jpeg' || 'image/png' || 'image/gif') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

module.exports = multer({
    storage,
    fileFilter,
    limits
})

