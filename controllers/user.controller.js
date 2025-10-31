const prisma = require('../prisma/prisma-client')

class UserController {
  async getById(req, res) {
    const { id } = req.params
    const userId = req.user.userId

    // Валидация ID
    const userIdNum = parseInt(id)
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Некорректный ID пользователя' })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userIdNum }, // Исправлено: передаем числовой ID
        include: {
          followers: {
            select: {
              follower: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          following: {
            select: {
              following: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      // Исправлено условие проверки подписки
      const isFollowing = await prisma.follows.findFirst({
        where: {
          followerId: userId,
          followingId: userIdNum, // Исправлено: было following: id
        },
      })

      // Форматируем ответ, убирая пароль
      const { password, ...userWithoutPassword } = user

      res.json({
        ...userWithoutPassword,
        isFollowing: Boolean(isFollowing),
      })
    } catch (error) {
      console.error('Ошибка получения пользователя', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async update(req, res) {
    const { id } = req.params
    const { email, name, dateOfBirth, bio, location } = req.body
    const userId = req.user.userId

    // Валидация ID
    const userIdNum = parseInt(id)
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Некорректный ID пользователя' })
    }

    if (userIdNum !== userId) {
      return res.status(403).json({ error: 'Нет доступа для редактирования этого профиля' })
    }

    let filePath
    if (req.file && req.file.path) {
      filePath = `/${req.file.path}`
    }

    try {
      // Проверка уникальности email, если он предоставлен
      if (email) {
        const existEmail = await prisma.user.findFirst({
          where: {
            email: email,
            NOT: { id: userIdNum }, // Исключаем текущего пользователя
          },
        })

        if (existEmail) {
          return res.status(400).json({ error: 'Email уже используется другим пользователем' })
        }
      }

      // Подготавливаем данные для обновления
      const updateData = {}

      if (email) updateData.email = email
      if (name) updateData.name = name
      if (filePath) updateData.avatarUrl = filePath
      if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth)
      if (bio !== undefined) updateData.bio = bio
      if (location) updateData.location = location

      // Если нет данных для обновления
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' })
      }

      const user = await prisma.user.update({
        where: { id: userIdNum },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          dateOfBirth: true,
          bio: true,
          location: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      res.json(user)
    } catch (error) {
      console.error('Ошибка обновления пользователя', error)

      // Обработка ошибок Prisma
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      res.status(500).json({ error: 'Ошибка при обновлении профиля' })
    }
  }
  async current(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          dateOfBirth: true,
          bio: true,
          location: true,
          createdAt: true,
          updatedAt: true,
          followers: {
            select: {
              follower: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          following: {
            select: {
              following: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      // Форматируем ответ для удобства клиента
      const formattedUser = {
        ...user,
        followers: user.followers.map(f => f.follower),
        following: user.following.map(f => f.following),
        followersCount: user._count.followers,
        followingCount: user._count.following,
        postsCount: user._count.posts,
      }

      // Удаляем временные поля
      delete formattedUser._count

      res.json(formattedUser)
    } catch (error) {
      console.error('Ошибка получения пользователя', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new UserController()
