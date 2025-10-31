const express = require('express')
const router = express.Router()

const { authToken } = require('../middleware/auth')

const { followController } = require('../controllers')

router.post('', authToken, followController.follow)
router.delete('', authToken, followController.unfollow)

module.exports = router
