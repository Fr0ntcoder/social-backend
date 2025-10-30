const express = require('express')
const router = express.Router()

const authRouter = require('./auth')
const userRouter = require('./users')
const postRouter = require('./posts')
const commentRouter = require('./comments')
const likeRouter = require('./comments')
const folowRouter = require('./follows')


router.use('/users', userRouter)
router.use('/auth', authRouter)
router.use('/posts', postRouter)
router.use('/comments', commentRouter)
router.use('/likes', likeRouter)
router.use('/follows', folowRouter)

module.exports = router
