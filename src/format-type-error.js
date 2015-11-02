const { curry, intersperse, invoker, join, map, type } = require('ramda')
const { cyan } = require('chalk')
const path = require('path')
const firstOuterCallSite = require('./first-outer-call-site')
const renderCallSite = require('./render-call-site')
const formatHeader = require('./format-header')
const capitalize = require('./capitalize')
const nthStr = require('./nth-str')
const S = require('sanctuary')

const getFileName = invoker(0, 'getFileName')
const relative = curry(path.relative)
const unlines = join('\n')
const unwords = join(' ')
const quote = (x) => `‘${x}’`
const EMPTY = ''

const callSiteRelativePath = curry((cwd, site) =>
  relative(cwd, getFileName(site)))

const formatTypeError = (ui, fn, idx, val, err) => {
  const columns = ui.process.stdout.isTTY ? ui.process.stdout.columns : 80
  //    site :: Maybe Site
  const site = firstOuterCallSite(err)
  const relSitePath = map(callSiteRelativePath(ui.process.cwd()), site)
  const header = formatHeader(columns, 'Ramda Type Error', S.fromMaybe('', relSitePath))
  const errLines = unlines(S.fromMaybe([], map(renderCallSite, site)))

  return unlines(intersperse(EMPTY, [
    header,
    errLines,
    unwords([
      ' ', capitalize(nthStr(idx)), 'argument to', quote(fn.name),
      'was', cyan.bold(type(val)), 'instead of',
      join(' or ', map(cyan.bold, fn.args[idx].types))
    ]),
    unwords([ ' ', fn.name, '::', fn.sig ]),
    unwords([ ' ', `http://ramdajs.com/docs/#${fn.name}` ])
  ])) + '\n'
}

module.exports = formatTypeError
