const fs = require('fs')
const path = require('path')
const Exception = require('@model/exception')
const yaml = require('js-yaml')

module.exports = {
  manifest: (filename) => {
    let file = path.parse(filename)

    if (!fs.existsSync(filename)) {
      filename = path.join(file.dir, `${file.name}.default${file.ext}`)
    }

    if (!fs.existsSync(filename)) {
      throw new Exception(`YAML: File does not exists: ${filename}`)
    }

    return yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
  }
}