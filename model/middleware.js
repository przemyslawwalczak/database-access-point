class Middleware {
  constructor(request, response) {
    this.request = request
    this.response = response
  }

  async middleware(request, response) {}
  extends(sandbox) {}
}

module.exports = Middleware