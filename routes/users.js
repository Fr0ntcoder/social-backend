const express = require("express");
const router = express.Router();

const { userController } = require('../controllers')

router.get('/current', userController.current)
router.get('/:id', userController.getById)
router.put('/:id', userController.update)

module.exports = router
