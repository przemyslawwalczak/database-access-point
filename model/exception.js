class Exception extends Error {
  constructor(message, status = 500) {
    super(message)

    this.id

    this.status = status
  }
}

module.exports = Exception

module.exports.validate = class Validation extends Exception {
  constructor(message, status) {
    super(message, status)

    this.array = []
  }
}

module.exports.field = class Field extends Exception {
  constructor(name, message) {
    super(message)

    this.name = name
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message
    }
  }
}

module.exports.system = class System extends Exception {
  constructor(error, status) {
    super(error.message, status)

    this.id = 'INTERNAL_ERROR'

    this.stack = error.stack
  }
}