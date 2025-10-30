const prisma = require('../prisma/prisma-client')
const path = require('path')
const bcrypt = require('bcryptjs')
const Jdenticon = require('jdenticon')
const fs = require('fs')
const jwt = require('jsonwebtoken')

class AuthController {
  async register(req, res) {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }
    try {
      // Проверяем,существуют ли пользователь
      const existiUser = await prisma.user.findUnique({ where: { email } })
      if (existiUser) {
        return res.status(400).json({ error: 'Пользователь уже существует' })
      }

      // Хэшируем пароль
      const hashPassword = await bcrypt.hash(password, 10)

      const png = Jdenticon.toPng(`${name}_${Date.now()}`, 200)
      const avatarName = `${name}_${Date.now()}.png`
      const avatarPath = path.join(__dirname, '/../uploads', avatarName)
      fs.writeFileSync(avatarPath, png)

      // Создаем пользователя
      const user = await prisma.user.create({
        data: {
          email,
          password: hashPassword,
          name,
          avatarUrl: `/uploads/${avatarName}`,
        },
      })

      res.json(user)
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  async login(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны!' })
    }

    try {
      // Проверяем, верен ли логин и пароль
      const user = prisma.user.findUnique({ where: email })

      if (!user) {
        return res.status(400).json({ error: 'Неверный логин и пароль' })
      }

      const validPassword = bcrypt.compare(password, user.password)

      if (!validPassword) {
        return res.status(400).json({ error: 'Неверный пароль' })
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY)

      res.json({ token })
    } catch (error) {
      console.error('Ошибка авторизации:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new AuthController()
