const util = require('@module/util')
const massive = require('massive')

const config = util.require('.database/manifest')

module.exports = massive(config.database.connection, config.database.massive)
.then((result) => {
  console.log('Connected to database:', config.database.connection.host + ':' + config.database.connection.port)
  module.exports = result
})
.catch(e => {
  console.log(e)

  throw e
})