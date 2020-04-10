const path = require('path')

module.exports = {
  database: {
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'postgres',
      password: 'root'
    },

    massive: {
      documentPkType: 'uuid',
      scripts: path.literal('.database/script')
    }
  }
}