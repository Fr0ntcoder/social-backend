const prisma = require('../prisma/prisma-client')
class PostController {
  async create(req, res) {
    const { content } = req.body
    const authorId = req.user.userId

    if (!content) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      })

      res.json(post)
    } catch (error) {
      console.error('Ошибка создания поста', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async getAll(req, res) {
    const userId = req.user.userId

    try {
      const posts = await prisma.post.findMany({
        include: {
          likes: {
            select: {
              userId: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              dateOfBirth: true,
              createdAt: true,
              updatedAt: true,
              bio: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      const postsWithLikeStatus = posts.map(post => ({
        ...post,
        likedByUser: post.likes.some(like => like.userId === userId),
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
      }))

      res.json(postsWithLikeStatus)
    } catch (error) {
      console.error('Ошибка получения всех постов', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async getById(req, res) {
    const { id } = req.params
    const userId = req.user.userId

    try {
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
        include: {
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          likes: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
      })

      if (!post) {
        return res.status(404).json({ error: 'Пост не найден' })
      }

      const postWithLikeStatus = {
        ...post,
        likedByUser: post.likes.some(like => like.userId === userId),
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
      }

      res.json(postWithLikeStatus)
    } catch (error) {
      console.error('Ошибка получения поста', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async delete(req, res) {
    const { id } = req.params
    const userId = req.user.userId

    try {
      const post = await prisma.post.findUnique({
        where: { id },
      })

      if (!post) {
        return res.status(404).json({ error: 'Пост не найден' })
      }

      if (post.authorId !== userId) {
        return res.status(403).json({ error: 'Нет доступа для удаления этого поста' })
      }

      // Используем transaction для атомарного удаления
      await prisma.$transaction(async tx => {
        await tx.comment.deleteMany({
          where: { postId: id },
        })
        await tx.like.deleteMany({
          where: { postId: id },
        })
        await tx.post.delete({
          where: { id: id },
        })
      })

      res.json({ message: 'Пост и все связанные данные успешно удалены' })
    } catch (error) {
      console.error('Ошибка удаления поста', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new PostController()
