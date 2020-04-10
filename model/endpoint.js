class Endpoint {
  constructor(route) {
    this._route = route
    this._middleware = []
  }
}

module.exports = Endpoint

module.exports.use = function (...objects) {
  let middlewares = []

  let result = class extends this {
    constructor() {
      super(...arguments)

      this._middleware = middlewares
    }
  }

  for (let middleware of objects) {
    middlewares.push(middleware)
  }

  return result
}

module.exports.route = function (...route) {
  let result = class extends Endpoint {
    constructor() {
      super(...route)
    }
  }

  result._route = route

  return result
}