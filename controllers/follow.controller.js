class FollowController {
  async follow(req, res) {
    const followingId = req.body
    const userId = req.user.userId

    if (followingId === userId) {
      return res.status(500).json({ error: 'Вы не можете подписаться на самого себя' })
    }

    try {
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
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      })

      res.status(201).json({ message: 'Подписка успешно создана' })
    } catch (error) {
      console.error('Ошибка создания подписки', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async unfollow(req, res) {
    const { followingId } = req.body
    const userId = req.user.userId

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
    } catch (error) {
      console.error('Вы не смогли отписаться', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new FollowController()
