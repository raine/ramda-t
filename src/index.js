const { __, any, anyPass, curry, equals, find, identity, ifElse, invoker, mapObjIndexed, not, pipe, prop, propEq, reject, type } = require('ramda')
const mainRamda = require.main.require('ramda')
const path = require('path')
const docs = require(path.join(__dirname, '..', 'ramda.json'))
const ccurryN = require('./ccurryN')
const nthStr = require('./nth-str')
const isMyCallSite = require('./is-my-call-site');
const formatTypeError = require('./format-type-error');
const formatTypeErrorMessage = require('./format-type-error-message')
const stackChain = require('stack-chain')
const debug = require('debug')('ramda-t')

const PACKAGE_ROOT = path.resolve(__dirname, '..')
const when = ifElse(__, __, identity)
const isFunction = pipe(type, equals('Function'))
const quote = (x) => `‘${x}’`

const hasMethod = pipe(prop, type, equals('Function'))
const isVariadic = propEq('variable', true)
const getArg = (fn, idx) =>
  fn.args[idx] || find(isVariadic, fn.args)

const ANY_TYPE = '*'
const validType = curry((val, t) =>
  t === ANY_TYPE || type(val) === t)

//    validArgType :: * -> Object(Arg) -> Boolean
const validArgType = (val, arg) =>
  any(validType(val), arg.types)

const check = curry((fnName, idx, val) => {
  debug('check', { fnName, idx, val })
  const fn = find(propEq('name', fnName), docs)
  const arg = getArg(fn, idx)

  if (arg == null)
    return debug(`warning: couldn't find documentation for ${nthStr(idx)} argument of ${quote(fnName)}`)

  if (not(validArgType(val, arg)) && not(hasMethod(fnName, val))) {
    const err = new TypeError(formatTypeErrorMessage(fn, idx, val))
    console.error(formatTypeError(fn, idx, val, err))
    throw err
  }
})

const wrapWithCheck = (fn, name) =>
  ccurryN(check(name), fn.length, [], fn)

module.exports = mapObjIndexed(when(isFunction, wrapWithCheck), mainRamda)
module.exports.__ = mainRamda.__ // ^ loses this

const getFileName = invoker(0, 'getFileName')
const isStackNoise = anyPass([
  isMyCallSite,
  pipe(getFileName, equals('module.js'))
])

stackChain.filter.attach((error, frames) =>
  reject(isStackNoise, frames))

debug('ramda-t package root', PACKAGE_ROOT)
debug('extending ramda version', require.main.require('ramda/package.json').version)
