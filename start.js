/**
 * Schemas should have a hash of their table script.
 * Each table values should have configurable options.
 * That is later checked against the tables in the database,
 * and applies renaming or alters to the table.
 * Keeping the tables always up to date on demand.
 * Doesn't matter how we build the queries, matters that the tables are always up to date of schema.
 * Which is really important.
 * Query builder can be optimised to do lot sort of action, based on a need.
 * 
 * Before any migration, create backup script for postgres as:
 * A .database/{name}/{table}-{timestamp}.sql
 * 
 * Make sure nothing can go wrong at this point, and if it does only marginal losses would occur.
 * This project is aiming at saving time creating SQL queries and REST Api a breeze.
 * Also this will handle a database migration to a MUST files to keep the schema up to date.
 * As this is only one application that will be a HUGE extension to a database for accessing it in public.
 * Every authorization and routing MUST be as simple as possible. As well as every extension possible.
 * And standards preserved and defined below.
 * 
 * Every API Request MUST return one or couple of following:
 * data - on successful API Request
 * error - error code or uuid as a result of a request
 * validation - list of validation error messages at what row
 * message - a meaningul message explaining the reasoning of error or validation response
 * 
 * These are the cases where some of the data returned is optional.
 * 
 * 1. When data is returned, message, validation and error is gone.
 * 2. When error is returned, data and validation is gone.
 * 3. When validation is returned, data and message is gone.
 * 
 * This standarised response will be a easy to remember case of responses per action.
 * 
 * Validation errors are returned only when a validation is applied to a row value.
 * Any validation errors will stop a query or transaction from executing/comitting.
 * 
 * This project will do:
 * Connect to a database and act as ORM 
 * -> Will check version of schemas in the database
 * -> Apply a warning or question if you would like to run the migration (It will exit the project for now)
 * -> If everything is up to date
 * -> Will follow with running a API Endpoint server and start accepting requests.
 * 
 * Migration
 * This project aims at focusing on Schema migration to a extend of applying minimal fixes/adaptation
 * to a table schema and all functionality of a database. Leaving one interface for doing EVERYTHING
 * in best possible way.
 * 
 * I HIGHLY DOUBT that the database will require really complex queries. Itself the queries are simple enough already.
 * 
 * The problem this project is looking to solve, is constantly keeping new uneeded sql files, or scripts that
 * are often hard to maintain by their unreadibility.
 * 
 * I would like in this project to maintain the best SQL practices in queries and apply best possible
 * optimisations and good, fast and light layer between database and REST Api's.
 * 
 * Meaningful and light queries, is the key for this project.
 * And as less files as possible.
 */

require('./module/literal-require')

const express = require('express')
const YAML = require('@module/yaml')
const http = require('http')
const https = require('https')
const path = require('path')
const manifest = YAML.manifest(path.literal('.endpoint/manifest.yaml'))
const bodyparser = require('body-parser')
const helmet = require('helmet')

const util = require('@module/util')

const Exception = require('@model/exception')
const Middleware = require('@model/middleware')

const setup = async () => {
  await require('@module/db')

  let server
  switch (manifest.api.protocol) {
    case 'http':
      server = http.createServer()
      break

    case 'https':
      server = https.createServer()
      break

    default: throw new Exception(`API: Invalid protocol: ${manifest.api.protocol}`)
  }

  const application = express(server)

  application.use(helmet())

  application.use(bodyparser.urlencoded({ extended: false }))
  application.use(bodyparser.json())

  let endpoint = express.Router()

  let directory = path.literal('.endpoint')

  util.walk(directory).forEach((filename) => {
    let route = filename.replace(directory, '').replace('\\', '/')
    let file = path.parse(route)

    let object = require(filename)

    let point = object._route || [(file.name === 'index' ? file.dir : [file.dir, file.name].join('/').replace(/[\/]+/, '/'))]

    endpoint.all(point, (request, response, next) => {
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
          console.log(`\x1b[36m${request.method} \x1b[33m${request.url}\x1b[0m - ${parseInt(process.hrtime.bigint() - timestamp) / 1000000} ms`)
        })
      })()
      .then((result) => {
        if (response.headersSent) { return }

        if (!result) {
          return response.json({ data: null })
        }

        response.json({ data: result })
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

  application.use(endpoint)

  endpoint.all('*', (request) => {
    throw new Exception(`Undefined route: ${request.method}: ${request.url}`)
  })

  application.use((e, request, response, next) => {
    // TODO: Logging of that error

    if (e instanceof Exception.system) {
      console.log(e)
    }

    response.status(e.status).json({
      error: e.id,
      message: e.message,
      validate: (e instanceof Exception.validate) ? e.array : undefined
    })
  })
  
  return { application }
}

setup()
.then(async ({ application }) => {
  let server = application.listen(manifest.api.port, manifest.api.host, () => {
    console.log('REST Api Endpoint listening on:', server.address())
  })
})
.catch(e => {
  const db = require('@module/db')

  db.instance.$pool.end()

  console.log(e)
})
.catch(e => {
  console.log('UNCAUGHT_EXCEPTION:', e)
})