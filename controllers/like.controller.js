const prisma = require('../prisma/prisma-client')

class LikeController {
  async like(req, res) {
    const { postId } = req.body
    const userId = req.user.userId

    if (!postId) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    try {
      const existLike = await prisma.like.findFirst({
        where: { postId, userId },
      })

      if (existLike) {
        return res.status(400).json({ error: 'Все уже поставили лайк' })
      }

      const like = await prisma.like.create({
        data: { postId, userId },
      })

      res.json(like)
    } catch (error) {
      console.error('Лайк не поставлен', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async unlike(req, res) {
    const { id } = req.params
    const userId = req.user.userId

    if (!id) {
      return res.status(400).json({ error: 'Все уже поставили дизлайк' })
    }

    try {
      const existLike = await prisma.like.findFirst({
        where: { postId: id, userId },
      })
      if (!existLike) {
        return res.status(400).json({ error: 'лайк уже существует' })
      }

      const like = await prisma.like.deleteMany({
        where: { postId: id, userId },
      })

      res.json(like)
    } catch (error) {
      console.error('Дизлайк не поставлен', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new LikeController()
