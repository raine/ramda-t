const { join, map, type } = require('ramda')
const { cyan } = require('chalk')
const formatErrorContext = require('./format-error-context')
const formatHeader = require('./format-header')
const capitalize = require('./capitalize')
const nthStr = require('./nth-str')

const unlines = join('\n')
const unwords = join(' ')
const quote = (x) => `‘${x}’`
const EMPTY = ''

const formatWarning = (fn, idx, val, err) =>
  unlines([
    formatHeader('Ramda Type Error'),
    EMPTY,
    unlines(formatErrorContext(err)),
    EMPTY,
    unwords([
      ' ', capitalize(nthStr(idx)), 'argument to', quote(fn.name),
      'was', cyan.bold(type(val)), 'instead of',
      join(' or ', map(cyan.bold, fn.args[idx].types))
    ]),
    EMPTY,
    unwords([ ' ', fn.name, '::', fn.sig ]),
    EMPTY,
    unwords([ ' ', `http://ramdajs.com/docs/#${fn.name}` ]),
    EMPTY
  ])


module.exports = formatWarning
