const { prisma } = require('../prisma/prisma-client')
class PostController {
  async create(req, res) {
    const { content } = req.body

    const authorId = req.user.userId

    if (!content) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    try {
      const post = await prisma.user.create({
        data: {
          content,
          authorId,
        },
      })

      res.json(post)
    } catch (error) {
      console.error('Ошибка создания поста', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async getAll() {
    const userId = req.user.userId

    try {
      const posts = await prisma.post.findMany({
        include: {
          likes: true,
          author: true,
          comments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      const postsLike = posts.map(post => ({ ...post, likedByUser: post.likes.some(like => like.userId === userId) }))

      res.json(postsLike)
    } catch (error) {
      console.error('Ошибка получения всех постов', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async getById() {
    const { id } = req.params
    const userId = req.user.userId

    try {
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
        include: {
          comments: {
            user: true,
          },
          likes: true,
          author: true,
        },
      })

      if (!post) {
        return res.status(404).json({ error: 'Пост не найден' })
      }

      const postLike = {
        ...post,
        likedByUser: post.likes.some(like => like.userId === userId),
      }

      res.json(postLike)
    } catch (error) {
      console.error('Ошибка получения поста', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async delete() {
    const { id } = req.params
    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' })
    }

    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    try {
      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
      ])

      res.json(transaction)
    } catch (error) {
      console.error('Ошибка удаления поста', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new PostController()
