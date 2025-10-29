const prisma = require('../prisma/prisma-client')

class UserController {
  async getById(req, res) {
    const { id } = req.params
    const userId = req.user.userId

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          followers: true,
          following: true,
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { following: id }],
        },
      })

      res.json({ ...user, isFollowing: Boolean(isFollowing) })
    } catch (error) {
      console.error('Ошибка получения пользователя', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async update(req, res) {
    const { id } = req.params
    const { email, name, dateOfBirth, bio, location } = req.body

    let filePath

    if (req.file && req.file.path) {
      filePath = req.file.path
    }

    if (id !== req.user.userId) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    try {
      if (email) {
        const existEmail = await prisma.user.findFirst({
          where: { email },
        })

        if (existEmail && existEmail.id !== id) {
          return res.status(400).json({ error: 'Почта уже используется' })
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      })
      res.json(user)
    } catch (error) {
      console.error('Ошибка обновления пользователя', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async current(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
        include: {
          followers: {
            include: {
              follower: true
            }
          },
          following: {
            include: {
              following: true
            }
          }
        }
      })

      if(!user) {
        return res.status(400).json({error: 'Не удалось найти пользователя'})
      }

      res.json(user)
    } catch (error) {
      console.error('Ошибка получения пользователя', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new UserController()
