const { curry, identity, intersperse, join, map, prop, type, useWith } = require('ramda')
const { cyan } = require('chalk')
const path = require('path')
const firstOuterCallSite = require('./first-outer-call-site')
const renderCallSite = require('./render-call-site')
const formatHeader = require('./format-header')
const capitalize = require('./capitalize')
const nthStr = require('./nth-str')
const S = require('sanctuary')

const relative = curry(path.relative)
const unlines = join('\n')
const unwords = join(' ')
const quote = (x) => `‘${x}’`
const EMPTY = ''

const siteRelativePath =
  useWith(relative, [ identity, prop('file') ])

const formatTypeError = (ui, fdoc, arg, idx, val, err) => {
  const columns = ui.process.stdout.isTTY ? ui.process.stdout.columns : 80
  //    site :: Maybe Site
  const cwd = ui.process.cwd()
  const site = firstOuterCallSite(err)
  const relSitePath = map(siteRelativePath(cwd), site)
  const header = formatHeader(columns, 'Ramda Type Error', S.fromMaybe('', relSitePath))
  const errLines = unlines(S.fromMaybe([], map(renderCallSite, site)))

  return unlines(intersperse(EMPTY, [
    header,
    errLines,
    unwords([
      ' ', capitalize(nthStr(idx)), 'argument to', quote(fdoc.name),
      'was', cyan.bold(type(val)), 'instead of',
      join(' or ', map(cyan.bold, arg.types))
    ]),
    unwords([ ' ', fdoc.name, '::', fdoc.sig ]),
    unwords([ ' ', `http://ramdajs.com/docs/#${fdoc.name}` ])
  ])) + '\n'
}

module.exports = formatTypeError
