const fs = require('fs')
const Path = require('path')

module.exports = {
  require: (path) => {
    let filename = Path.parse(path)

    try {
      return require(path)
    } catch(e) {
      path = Path.join(filename.dir, filename.name + '.default')
      return require(path)
    }

  },

  walk: function (directory, extension = ['.js']) {
    var results = []
    var list = fs.readdirSync(directory)

    list.forEach((file) => {
      file = Path.join(directory, file)
      let stat = fs.statSync(file)
      
      if (stat && stat.isDirectory()) { 
        results = results.concat(this.walk(file, extension))
      } else { 
        let format = Path.parse(file)

        if (extension.indexOf(format.ext) > -1) {
          results.push(file)
        }
      }
    })

    return results
  }
}