const path = require('path')
const PACKAGE_ROOT = path.resolve(__dirname, '..')
const pathInside = require('./path-inside')
const { not } = require('ramda')

module.exports = (s) =>
  pathInside(PACKAGE_ROOT, s.getFileName())
