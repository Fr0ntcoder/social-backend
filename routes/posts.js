const express = require('express')
const router = express.Router()

const { authToken } = require('../middleware/auth')

const { postController } = require('../controllers')

router.post('/', authToken, postController.create)
router.get('/', authToken, postController.getAll)
router.get('/:id', authToken, postController.getById)
router.delete('/:id', authToken, postController.delete)

module.exports = router
