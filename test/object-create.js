class Parent {
  constructor() {
    console.log('building parent')
  }

  static build() {
    return new this
  }
}

class Child extends Parent {
  constructor() {
    super()

    console.log('building child')
  }

  test() {
    console.log('hello from test')
  }
}

Child.prototype.test = () => {
  console.log('different function')
}

const result = Child.build()

result.test()