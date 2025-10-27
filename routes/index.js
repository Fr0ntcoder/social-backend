const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const defaultDestination = 'uploads'

if(!fs.existsSync(defaultDestination)) {
  fs.mkdirSync(defaultDestination)
}

const storage = multer.diskStorage({
  destination: defaultDestination,
  filename: function(req,file,cb) {
      cb(null,file.originalname)
  }
})

const uploads = multer({storage})

router.get('/register', (req, res) => {
  res.send('register')
})

module.exports = router
