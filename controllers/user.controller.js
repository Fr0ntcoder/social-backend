class UserController {
  async getById(req, res) {
    res.send('getById')
  }
  async update(req, res) {
    res.send('update')
  }
  async current(req, res) {
    res.send('current')
  }
}

module.exports = new UserController()
