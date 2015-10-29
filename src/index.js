const { __, toString, any, anyPass, curry, equals, find, identity, ifElse, invoker, mapObjIndexed, not, pipe, prop, propEq, reject, type, useWith } = require('ramda')
const path = require('path')
const specialCurryN = require('./special-curryN')
const nthStr = require('./nth-str')
const isMyCallSite = require('./is-my-call-site');
const formatTypeError = require('./format-type-error');
const formatTypeErrorMessage = require('./format-type-error-message')
const stackChain = require('stack-chain')
const debug = require('debug')('ramda-t')

const when = ifElse(__, __, identity)
const isFunction = pipe(type, equals('Function'))
const quote = (x) => `‘${x}’`
const hasMethod = pipe(prop, isFunction)
const isVariadic = propEq('variable', true)
const ANY_TYPE = '*'

const getArg = (fn, idx) =>
  fn.args[idx] || find(isVariadic, fn.args)

//    validType :: * -> String -> Boolean
const validType = curry((val, t) =>
  t === ANY_TYPE || type(val) === t)

//    anyValidType :: * -> Object -> Boolean
const anyValidType = useWith(any, [ validType, prop('types') ])

const check = curry((fnName, idx, val) => {
  const fn = find(propEq('name', fnName), docs)
  const arg = getArg(fn, idx)
  debug(`checking ${fnName} idx=${idx} arg=${toString(arg)} val=${toString(val)}`)

  if (arg == null)
    return debug(`warning: no doc for ${nthStr(idx)} argument of ${quote(fnName)}`)

  if (not( anyValidType(val, arg) || (val != null && hasMethod(fnName, val)) )) {
    const err = new TypeError(formatTypeErrorMessage(fn, idx, val))
    console.error(formatTypeError(fn, idx, val, err))
    throw err
  }
})

//    wrapFunction :: Function -> String -> Function
const wrapFunction = (fn, name) =>
  specialCurryN(check(name), fn.length, [], fn)

const mainRamda = require.main.require('ramda')
const mainRamdaVersion = require.main.require('ramda/package.json').version
const PACKAGE_ROOT = path.resolve(__dirname, '..')
const JSON_DOCS = path.join(PACKAGE_ROOT, 'ramda.json')
const docs = require(JSON_DOCS)

module.exports = mapObjIndexed(when(isFunction, wrapFunction), mainRamda)
module.exports.__ = mainRamda.__ // ^ loses this

const getFileName = invoker(0, 'getFileName')
const isStackNoise = anyPass([
  isMyCallSite,
  pipe(getFileName, equals('module.js'))
])

stackChain.filter.attach((error, frames) =>
  reject(isStackNoise, frames))

Error.stackTraceLimit = 20

debug('ramda-t package root', PACKAGE_ROOT)
debug('reading docs json from path', JSON_DOCS)
debug('ramda version', mainRamdaVersion)
