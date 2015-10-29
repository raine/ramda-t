const path = require('path')
const pathInside = require('./path-inside')
const PACKAGE_ROOT = path.resolve(__dirname, '..')

module.exports = (site) =>
  pathInside(PACKAGE_ROOT, site.getFileName())
