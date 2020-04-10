const util = require('@module/util')
const path = require('path')
const express = require('express')
const Exception = require('@model/exception')
const Middleware = require('@model/middleware')

module.exports = new class Router {
  constructor() {
    this.directory = path.literal('.endpoint')

    this.endpoint = express.Router()

    util.walk(this.directory).forEach((filename) => {
      let route = filename.replace(this.directory, '').replace('\\', '/')
      let file = path.parse(route)

      let object = require(filename)

      let point = object._route || [(file.name === 'index' ? file.dir : [file.dir, file.name].join('/'))]

      console.log('route:', point)

      this.endpoint.all(point, (request, response, next) => {
        (async () => {
          let timestamp = process.hrtime.bigint()

          let sandbox = new object(request, response)

          let hook = sandbox[request.method.toLowerCase()]

          if (!hook) {
            throw new Exception(`Undefined route: ${request.method}: ${request.url}`)
          }

          for (let object of sandbox._middleware) {
            if (response.headersSent) {
              return
            }

            if (typeof object !== 'function') {
              throw new Exception(`Using middleware of unallowed type`)
            }

            if (object.prototype instanceof Middleware) {
              let result = new object(request, response)

              await Promise.resolve(result.extends(sandbox))
              
              if (result.middleware) {
                await Promise.resolve(result.middleware(request, response))
              }

              continue
            }

            if (typeof object === 'function') {
              await new Promise((resolve, reject) => {
                object(request, resolve, (e) => {
                  if (e) return reject(e)

                  resolve()
                })
              })
              continue
            }

            throw new Exception(`Endpoint.use middleware of unallowed type`)
          }

          return await Promise.resolve(hook(request, response, next))
          .finally(() => {
            console.log(`${request.method} ${request.url} - ${parseInt(process.hrtime.bigint() - timestamp) / 1000000} ms`)
          })
        })()
        .then((result) => {
          if (response.headersSent) { return }

          if (!result) {
            return response.json({ data: null })
          }

          response.json({  data: result })
        })
        .catch(e => {
          if (response.headersSent) { return }

          if (e instanceof Exception) {
            return next(e)
          }

          next(new Exception.system(e))
        })
      })
    })

    this.endpoint.all('*', (request) => {
      throw new Exception(`Undefined route: ${request.method}: ${request.url}`)
    })
  }
}