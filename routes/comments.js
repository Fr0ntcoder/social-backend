const express = require('express')
const router = express.Router()

const { authToken } = require('../middleware/auth')

const { commentController } = require('../controllers')

router.post('/', authToken, commentController.create)
router.delete('/:id', authToken, commentController.delete)

module.exports = router
