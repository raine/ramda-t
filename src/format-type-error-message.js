const { join, toString } = require('ramda')
const nthStr = require('./nth-str')

const quote = (x) => `‘${x}’`
const unwords = join(' ')

const formatTypeErrorMessage = (fn, arg, idx, val) => unwords([
  quote(fn.name), 'requires a value of type', join(' or ', arg.types),
  'as its', nthStr(idx), 'argument; received', toString(val)
])

module.exports = formatTypeErrorMessage
