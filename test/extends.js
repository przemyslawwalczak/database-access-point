class Endpoint {
  constructor(route) {
    console.log('route:', route)

    this.route = route
  }
}

Endpoint.use = function (extension) {
  return extension.hook.call(this)
}

Endpoint.route = (route) => {
  console.log('routing test extend:', route)

  let result = class extends Endpoint {
    constructor() {
      super(route)
    }
  }

  return result
}

class test {
  constructor() {
    console.log('constructing test')
  }

  hello() {
    console.log('world')
  }

  async middleware() {

  }

  static hook() {
    console.log('extends:', this)

    this.prototype.network = new test

    return this
  }
}

class Index extends Endpoint.route('/test-route/:hello/:world').use(test) {
  constructor() {
    super()

    this.network.hello()
  }
}

let index = new Index

console.log(index)

// index.network.hello()

console.log(index.route)