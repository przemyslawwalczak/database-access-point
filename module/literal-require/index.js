const Module = require('module')
const path = require('path')

if (Module.prototype._require !== undefined || path.literal !== undefined) {
  return
}

const package = require(path.join(process.cwd(), 'package'))
const namespace = package ? (package.namespace || {}) : {}

for (let name in namespace) {
  let result = namespace[name]

  let command

  while (command = result.match(/\$\s*\{(.*)\}/)) {
    result = result.replace(command[0], eval(command[1]))
  }

  namespace[name] = path.normalize(result)
}

const _require = Module.prototype.require

Module.prototype.require = function require (module_path) {
  if (path.isAbsolute(module_path)) {
    return _require.call(this, path.resolve(module_path))
  }

  for (let name in namespace) {
    module_path = module_path.replace(name, namespace[name])
  }

  return _require.call(this, module_path)
}

path.literal = function literal (...path) {
  let module_path = this.join.apply(this, path)

  for (let name in namespace) {
    module_path = module_path.replace(name, namespace[name])
  }

  return module_path
}