const { join, toString } = require('ramda')
const nthStr = require('./nth-str')

const quote = (x) => `‘${x}’`
const unwords = join(' ')

const formatTypeErrorMessage = (fn, idx, val) => unwords([
  quote(fn.name), 'requires a value of type', join(' or ', fn.args[idx].types),
  'as its', nthStr(idx), 'argument; received', toString(val)
])

module.exports = formatTypeErrorMessage
