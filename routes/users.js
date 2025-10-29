const express = require('express')
const router = express.Router()

const { userController } = require('../controllers')
const { authToken } = require('../middleware/auth')

router.get('/current', authToken, userController.current)
router.get('/:id', authToken, userController.getById)
router.put('/:id', authToken, userController.update)

module.exports = router
