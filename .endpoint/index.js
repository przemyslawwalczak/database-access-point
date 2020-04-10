const exports = class Index extends require('@model/endpoint') {
  async get() {
    return { hello: 'world' }
  }
}
