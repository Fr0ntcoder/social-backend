const prisma = require('../prisma/prisma-client')
class CommentController {
  async create(req, res) {
    const { postId, content } = req.body
    const userId = req.user.userId

    if (!postId || !content) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        return res.status(404).json({ error: 'Пост не найден' })
      }

      // Создаем комментарий
      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      })

      res.json(comment)
    } catch (error) {
      console.error('Ошибка создания комментария', error)

      // Обработка специфических ошибок Prisma
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Неверные данные' })
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async delete(req, res) {
    const { id } = req.params
    const userId = req.user.userId

    try {
      const comment = await prisma.comment.findUnique({
        where: { id },
      })

      if (!comment) {
        return res.status(404).json({ error: 'Комментарий не найден' })
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ error: 'Нет доступа' })
      }

      await prisma.comment.delete({ where: { id } })

      res.json({ message: 'Комментарий удален', comment })
    } catch (error) {
      console.error('Не удалось удалить комментарий', error)

      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Комментарий не найден' })
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new CommentController()
