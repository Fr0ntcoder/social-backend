const express = require('express')
const router = express.Router()

const userRouter = require('./users')
const authRouter = require('./auth')

router.use('/users', userRouter)
router.use('/auth', authRouter)

module.exports = router
