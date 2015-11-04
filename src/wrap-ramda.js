const { __, addIndex, any, contains, curry, equals, find, flip, forEach, identity, ifElse, mapObjIndexed, not, pipe, prop, propEq, propSatisfies, test, type } = require('ramda')
const specialCurryN = require('./special-curryN')
const debug = require('debug')('ramda-t')
const nthStr = require('./nth-str')
const formatTypeError = require('./format-type-error')
const formatTypeErrorMessage = require('./format-type-error-message')
const _arity = require('./arity')

const forEachIndexed = addIndex(forEach)
const when = ifElse(__, __, identity)
const isFunction = pipe(type, equals('Function'))
const quote = (x) => `‘${x}’`
const hasMethod = pipe(prop, isFunction)
const isVariadic = propEq('variable', true)
const getArg = (fn, idx) => fn.args[idx] || find(isVariadic, fn.args)
const noop = () => {}

const ANY_TYPE = '*'
const SYNONYMS = {
  'Lens': 'Function',
  'Array': 'Arguments'
}

//    synonymous :: String -> String -> Boolean
const synonymous = flip(propEq(__, __, SYNONYMS))

//    matchTypeOf :: * -> String -> Boolean
const matchTypeOf = curry((val, t) =>
  ANY_TYPE === t || type(val) === t || synonymous(type(val), t))

//    anyValidType :: * -> [String] -> Boolean
const anyValidType = (val, types) => any(matchTypeOf(val), types)

//    actsAsTransducer :: Object -> Bool
const actsAsTransducer = propSatisfies(test(/transformer/), 'description')

//    isTransformer :: Object -> Bool
const isTransformer = propSatisfies(isFunction, '@@transducer/step')

//    isValidType :: Object -> [String] -> * -> Boolean
const isValidType = (fdoc, types, val) => {
  if      (anyValidType(val, types))                 return true   // val's type is any of `types`
  else if (val != null && hasMethod(fdoc.name, val)) return true   // is `val` dispatchable?
  else if (val != null && actsAsTransducer(fdoc) &&
           contains('Array', types) &&
           isTransformer(val))                       return true   // list arg is transformer
  else                                               return false
}

//    validate :: UI -> Object -> Number -> * -> ()
const validate = curry((ui, fdoc, val, idx) => {
  const arg = getArg(fdoc, idx)
  debug(`checking ${quote(fdoc.name)}`, { idx, arg })

  if (arg == null)
    return debug(`warning: no doc for ${nthStr(idx)} argument of ${quote(fdoc.name)}`)

  if (not(isValidType(fdoc, arg.types, val))) {
    const err = new TypeError(formatTypeErrorMessage(fdoc, arg, idx, val))
    err.__declutterStackTrace = true
    ui.print(formatTypeError(ui, fdoc, arg, idx, val, err))
    throw err
  }
})

//    wrapFunction :: UI -> [Object] -> Function -> String -> Function
const wrapFunction = curry((ui, docs, fn, name) => {
  const fdoc = find(propEq('name', name), docs)

  if (fdoc == null) {
    debug(`warning: no doc for function ${quote(name)}`)
    return fn
  } else {
    return _arity(fn.length, specialCurryN(
      ui.eager ? validate(ui, fdoc) : noop,
      (args, thunk) => {
        try {
          return thunk()
        } catch (err) {
          forEachIndexed(validate(ui, fdoc), args)
          throw err
        }
      },
      fn.length,
      [],
      fn
    ))
  }
})

//    wrapRamda :: UI -> [Object] -> Object -> Object
const wrapRamda = curry((ui, docs, ramda) => {
  const R = mapObjIndexed(when(isFunction, wrapFunction(ui, docs)), ramda)
  R.__ = ramda.__
  return R
})

module.exports = wrapRamda
