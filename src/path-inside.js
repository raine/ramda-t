const path = require('path')
const { curry, not } = require('ramda')
const startsWith = curry((x, str) => str.indexOf(x) === 0)

module.exports = (a, b) =>
  not(startsWith('..', path.relative(a, b)))
