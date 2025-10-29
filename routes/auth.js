const express = require("express");
const router = express.Router();
const multer = require('multer')
const fs = require('fs')

const { authController } = require('../controllers')
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

const uploads = multer({ storage })

router.post('/register', authController.register)
router.post('/login', authController.login)

module.exports = router
