const { __, any, complement, concat, curry, curryN, equals, filter, find, head, identity, ifElse, join, map, mapObjIndexed, nAry, not, pipe, prop, propEq, tail, toString, toUpper, type } = require('ramda')
const mainR = require.main.require('ramda')
const path = require('path')
const docs = require(path.join(__dirname, '..', 'ramda.json'))
const ccurryN = require('./ccurryN')
const nthStr = require('./nth-str')
const formatHeader = require('./format-header')
const { cyan } = require('chalk')
const callsites = require('error-callsites')
const stackChain = require('stack-chain')
const debug = require('debug')('ramda-t')

const startsWith = curry((x, str) => str.indexOf(x) === 0)
const pathInside = curryN(2, pipe(nAry(2, path.relative), startsWith('..'), not))
const notMyCallSite = complement((s) => pathInside(PACKAGE_ROOT, s.getFileName()))
const firstOuterCallSite = pipe(callsites, find(notMyCallSite))

const PACKAGE_ROOT = path.resolve(__dirname, '..')
const when = ifElse(__, __, identity)
const isFunction = pipe(type, equals('Function'))

const quote = (x) => `‘${x}’`
const lines = join('\n')
const words = join(' ')
const capitalize = (str) =>
  concat(toUpper(head(str)), tail(str))

const formatWarning = (fn, idx, val) =>
  lines([
    formatHeader('Ramda Type Error') + '\n',
    words([ ' ', capitalize(nthStr[idx]), 'argument to', quote(fn.name),
            'was', cyan.bold(type(val)), 'instead of',
            join(' or ', map(cyan.bold, fn.args[idx].types)) ]) + '\n',
    words([ ' ', fn.name, '::', fn.sig ]) + '\n',
    words([ ' ', `http://ramdajs.com/docs/#${fn.name}` ]) + '\n'
  ])

const formatTypeErrorMessage = (fn, idx, val) => words([
  quote(fn.name), 'requires a value of type', join(' or ', fn.args[idx].types),
  'as its', nthStr[idx], 'argument; received', toString(val)
])

const getArg = (fn, idx) =>
  fn.args[idx] || find(propEq('variable', true), fn.args)

const ANY_TYPE = '*'
const validType = curry((val, t) =>
  t === ANY_TYPE || type(val) === t)

//    validArgType :: * -> Object(Arg) -> Boolean
const validArgType = (val, arg) =>
  any(validType(val), arg.types)

const hasMethod = pipe(prop, type, equals('Function'))

const check = curry((fnName, idx, val) => {
  debug('check', { fnName, idx, val })
  const fn = find(propEq('name', fnName), docs)
  const arg = getArg(fn, idx)

  if (arg == null)
    return debug(`warning: couldn't find documentation for ${nthStr[idx]} argument of ${quote(fnName)}`)

  if (not(validArgType(val, arg)) && not(hasMethod(fnName, val))) {
    console.error(formatWarning(fn, idx, val))
    const err = new TypeError(formatTypeErrorMessage(fn, idx, val))
    throw err
  }
})

const curryCheckFn = (fn, name) =>
  ccurryN(check(name), fn.length, [], fn)

module.exports = mapObjIndexed(when(isFunction, curryCheckFn), mainR)
module.exports.__ = mainR.__ // ^ loses this

stackChain.filter.attach((error, frames) =>
  filter(notMyCallSite, frames))

debug('ramda-t package root', PACKAGE_ROOT)
debug('extending ramda version', require.main.require('ramda/package.json').version)
