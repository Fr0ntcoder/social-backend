const userController = require('./user.controller')
const authController = require('./auth.controller')
const postController = require('./post.controller')
const commentController = require('./comment.controller')
const likeController = require('./like.controller')

module.exports = {
  authController,
  userController,
  postController,
  commentController,
  likeController,
}
