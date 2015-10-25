const { __, any, anyPass, concat, curry, equals, find, head, identity, ifElse, invoker, join, map, mapObjIndexed, not, pipe, prop, propEq, reject, tail, toString, toUpper, type } = require('ramda')
const mainR = require.main.require('ramda')
const path = require('path')
const docs = require(path.join(__dirname, '..', 'ramda.json'))
const ccurryN = require('./ccurryN')
const nthStr = require('./nth-str')
const formatHeader = require('./format-header')
const formatErrContext = require('./format-err-context')
const isMyCallSite = require('./is-my-call-site');

const { cyan } = require('chalk')
const stackChain = require('stack-chain')
const debug = require('debug')('ramda-t')

const PACKAGE_ROOT = path.resolve(__dirname, '..')
const when = ifElse(__, __, identity)
const isFunction = pipe(type, equals('Function'))

const quote = (x) => `‘${x}’`
const unlines = join('\n')
const unwords = join(' ')
const capitalize = (str) =>
  concat(toUpper(head(str)), tail(str))

const formatWarning = (fn, idx, val, err) => {
  return unlines([
    formatHeader('Ramda Type Error') + '\n',
    unlines(formatErrContext(err)) + '\n',
    unwords([ ' ', capitalize(nthStr[idx]), 'argument to', quote(fn.name),
            'was', cyan.bold(type(val)), 'instead of',
            join(' or ', map(cyan.bold, fn.args[idx].types)) ]) + '\n',
    unwords([ ' ', fn.name, '::', fn.sig ]) + '\n',
    unwords([ ' ', `http://ramdajs.com/docs/#${fn.name}` ]) + '\n'
  ])
}

const formatTypeErrorMessage = (fn, idx, val) => unwords([
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
    const err = new TypeError(formatTypeErrorMessage(fn, idx, val))
    console.error(formatWarning(fn, idx, val, err))
    throw err
  }
})

const curryCheckFn = (fn, name) =>
  ccurryN(check(name), fn.length, [], fn)

module.exports = mapObjIndexed(when(isFunction, curryCheckFn), mainR)
module.exports.__ = mainR.__ // ^ loses this

Error.stackTraceLimit = Infinity

const getFileName = invoker(0, 'getFileName')
const isStackNoise = anyPass([
  isMyCallSite,
  pipe(getFileName, equals('module.js'))
])

stackChain.filter.attach((error, frames) =>
  reject(isStackNoise, frames))

debug('ramda-t package root', PACKAGE_ROOT)
debug('extending ramda version', require.main.require('ramda/package.json').version)
