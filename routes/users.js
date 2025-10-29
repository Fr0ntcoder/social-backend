const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')

const { authToken } = require('../middleware/auth')

const { userController } = require('../controllers')

const defaultDestination = 'uploads'

if (!fs.existsSync(defaultDestination)) {
  fs.mkdirSync(defaultDestination)
}

const storage = multer.diskStorage({
  destination: defaultDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

router.get('/current', authToken, userController.current)
router.get('/:id', authToken, userController.getById)
router.put('/:id', authToken, upload.single('avatar'), userController.update)

module.exports = router
