const path = require('path')
const pathInside = require('./path-inside')
const PACKAGE_ROOT = path.resolve(__dirname, '..')

module.exports = (file) => pathInside(PACKAGE_ROOT, file)
