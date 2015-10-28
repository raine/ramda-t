const { __, any, anyPass, curry, equals, find, identity, ifElse, invoker, mapObjIndexed, not, pipe, prop, propEq, reject, toString, type } = require('ramda')
const path = require('path')
const specialCurryN = require('./special-curryN')
const nthStr = require('./nth-str')
const isMyCallSite = require('./is-my-call-site');
const formatTypeError = require('./format-type-error');
const formatTypeErrorMessage = require('./format-type-error-message')
const stackChain = require('stack-chain')
const debug = require('debug')('ramda-t')

const PACKAGE_ROOT = path.resolve(__dirname, '..')
const JSON_DOCS = path.join(PACKAGE_ROOT, 'ramda.json')
const docs = require(JSON_DOCS)
const when = ifElse(__, __, identity)
const isFunction = pipe(type, equals('Function'))
const quote = (x) => `‘${x}’`
const fallback = curry((def, fn, val) => {
  try {
    return fn(val);
  } catch(e) {
    return def(val);
  }
});

const hasMethod = pipe(prop, isFunction)
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
  const fn = find(propEq('name', fnName), docs)
  const arg = getArg(fn, idx)
  debug(`checking ${fnName} idx=${idx} arg=${toString(arg)} val=${toString(val)}`)

  if (arg == null)
    return debug(`warning: couldn't find documentation for ${nthStr(idx)} argument of ${quote(fnName)}`)

  if (not( validArgType(val, arg) || (val != null && hasMethod(fnName, val)) )) {
    const err = new TypeError(formatTypeErrorMessage(fn, idx, val))
    console.error(formatTypeError(fn, idx, val, err))
    throw err
  }
})

const wrapWithCheck = (fn, name) =>
  specialCurryN(check(name), fn.length, [], fn)

const mainRamda = fallback(require, require.main.require, 'ramda')
const mainRamdaVersion = fallback(require, require.main.require, 'ramda/package.json').version

module.exports = mapObjIndexed(when(isFunction, wrapWithCheck), mainRamda)
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
