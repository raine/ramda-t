const { __, toString, any, curry, equals, find, identity, ifElse, mapObjIndexed, not, pipe, prop, propEq, type, useWith } = require('ramda')
const specialCurryN = require('./special-curryN')
const debug = require('debug')('ramda-t')
const nthStr = require('./nth-str')
const formatTypeError = require('./format-type-error')
const formatTypeErrorMessage = require('./format-type-error-message')

const ANY_TYPE = '*'

const when = ifElse(__, __, identity)
const isFunction = pipe(type, equals('Function'))
const quote = (x) => `‘${x}’`
const hasMethod = pipe(prop, isFunction)
const isVariadic = propEq('variable', true)
const getArg = (fn, idx) => fn.args[idx] || find(isVariadic, fn.args)

//    typeEqualOrAny :: * -> String -> Boolean
const typeEqualOrAny = curry((val, t) =>
  t === ANY_TYPE || type(val) === t)

//    anyValidType :: * -> [String] -> Boolean
const anyValidType = useWith(any, [ typeEqualOrAny, identity ])

//    isValidType :: String -> [String] -> * -> Boolean
const isValidType = (fname, types, val) => {
  if      (anyValidType(val, types))             return true   // val's type is any of `types`
  else if (val != null && hasMethod(fname, val)) return true   // is `val` dispatchable?
  else                                           return false
}

//    validate :: Function -> Object -> Number -> * -> ()
const validate = curry((print, fdoc, idx, val) => {
  const arg = getArg(fdoc, idx)
  debug(`checking ${fdoc.name} idx=${idx} arg=${toString(arg)} val=${toString(val)}`)

  if (arg == null)
    return debug(`warning: no doc for ${nthStr(idx)} argument of ${quote(fdoc.name)}`)

  if (not(isValidType(fdoc.name, arg.types, val))) {
    const err = new TypeError(formatTypeErrorMessage(fdoc, idx, val))
    print(formatTypeError(fdoc, idx, val, err))
    throw err
  }
})

//    wrapFunction :: Function -> [Object] -> Function -> String -> Function
const wrapFunction = curry((print, docs, fn, name) => {
  const fdoc = find(propEq('name', name), docs)
  if (fdoc == null) {
    debug(`warning: no doc for function ${quote(name)}`)
    return fn
  } else {
    return specialCurryN(validate(print, fdoc), fn.length, [], fn)
  }
})

//    wrapRamda :: (Function, [Object], Object) -> Object
const wrapRamda = (print, docs, ramda) =>
  mapObjIndexed(when(isFunction, wrapFunction(print, docs)),
                ramda)

module.exports = wrapRamda
