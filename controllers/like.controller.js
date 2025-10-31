const prisma = require('../prisma/prisma-client')

class LikeController {
  async like(req, res) {
    const { postId } = req.body
    const userId = req.user.userId

    if (!postId) {
      return res.status(400).json({ error: 'ID поста обязателен' })
    }

    try {
      // Проверяем существование поста
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        return res.status(404).json({ error: 'Пост не найден' })
      }

      const existLike = await prisma.like.findFirst({
        where: { postId, userId },
      })

      if (existLike) {
        return res.status(400).json({ error: 'Вы уже поставили лайк этому посту' })
      }

      const like = await prisma.like.create({
        data: { postId, userId },
      })

      res.status(201).json(like)
    } catch (error) {
      console.error('Лайк не поставлен', error)

      // Обработка ошибок Prisma
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Пост не найден' })
      }

      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Лайк уже существует' })
      }

      res.status(500).json({ error: 'Не удалось поставить лайк' })
    }
  }

  async unlike(req, res) {
    const { id } = req.params
    const userId = req.user.userId

    if (!id) {
      return res.status(400).json({ error: 'ID поста обязателен' })
    }

    try {
      const existLike = await prisma.like.findFirst({
        where: { postId: id, userId },
      })

      if (!existLike) {
        return res.status(400).json({ error: 'Лайк не найден' })
      }

      const like = await prisma.like.deleteMany({
        where: { postId: id, userId },
      })

      res.json(like)
    } catch (error) {
      console.error('Не удалось убрать лайк', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new LikeController()
