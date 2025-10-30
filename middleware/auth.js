const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => {
  const authHeader = req.headers['authorization']

  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Вы не авторизованы' })
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Невалидный токен' })
    }

    req.user = user

    next()
  })
}

module.exports = { authToken }
