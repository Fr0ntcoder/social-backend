const express = require('express')
const router = express.Router()

const { authToken } = require('../middleware/auth')

const { likeController } = require('../controllers')

router.post('', authToken, likeController.like)
router.delete('/:id', authToken, likeController.like)

module.exports = router
