const prisma = require('../prisma/prisma-client')

class FollowController {
  async follow(req, res) {
    const { followingId } = req.body
    const userId = req.user.userId

    if (!followingId) {
      return res.status(400).json({ error: 'ID пользователя обязателен' })
    }

    if (followingId === userId) {
      return res.status(400).json({ error: 'Вы не можете подписаться на самого себя' })
    }

    try {
      // Проверяем существование пользователя, на которого подписываемся
      const userToFollow = await prisma.user.findUnique({
        where: { id: followingId },
      })

      if (!userToFollow) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      const existFollow = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      })

      if (existFollow) {
        return res.status(400).json({ error: 'Подписка уже существует' })
      }

      await prisma.follows.create({
        data: {
          followerId: userId,
          followingId: followingId,
        },
      })

      res.status(201).json({ message: 'Подписка успешно создана' })
    } catch (error) {
      console.error('Ошибка создания подписки', error)

      // Обработка ошибок Prisma
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Пользователь не найден' })
      }

      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Подписка уже существует' })
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async unfollow(req, res) {
    const { followingId } = req.body
    const userId = req.user.userId

    if (!followingId) {
      return res.status(400).json({ error: 'ID пользователя обязателен' })
    }

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      })

      if (!follows) {
        return res.status(404).json({ error: 'Вы не подписаны на этого пользователя' })
      }

      await prisma.follows.delete({
        where: { id: follows.id },
      })

      res.json({ message: 'Вы успешно отписались' })
    } catch (error) {
      console.error('Не удалось отписаться', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new FollowController()
