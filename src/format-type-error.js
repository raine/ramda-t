const { curry, invoker, join, map, pipe, type } = require('ramda')
const { cyan } = require('chalk')
const path = require('path')
const firstOuterCallSite = require('./first-outer-call-site')
const formatErrorContext = require('./format-error-context')
const formatHeader = require('./format-header')
const capitalize = require('./capitalize')
const nthStr = require('./nth-str')
const getFileName = invoker(0, 'getFileName')

const relative = curry(path.relative)
const unlines = join('\n')
const unwords = join(' ')
const quote = (x) => `‘${x}’`
const EMPTY = ''

const errSourceRelativePath = (cwd, site) =>
  pipe(firstOuterCallSite,
       getFileName,
       relative(cwd))(site)

const formatTypeError = (ui, fn, idx, val, err) => {
  const errOriginPath = errSourceRelativePath(ui.process.cwd(), err)

  return unlines([
    formatHeader(ui.process.stdout.columns, 'Ramda Type Error', errOriginPath),
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
}


module.exports = formatTypeError
