const { __, toString, any, curry, equals, find, identity, ifElse, mapObjIndexed, not, pipe, prop, propEq, replace, type, useWith } = require('ramda')
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
const remove = replace(__, '')

//    _type :: * -> String
const _type = (x) =>
  x != null && x['@@type']
    ? remove('ramda/', x['@@type'])
    : type(x)

//    typeEqualOrAny :: * -> String -> Boolean
const typeEqualOrAny = curry((val, t) =>
  t === ANY_TYPE || _type(val) === t)

//    anyValidType :: * -> [String] -> Boolean
const anyValidType = useWith(any, [ typeEqualOrAny, identity ])

//    isValidType :: String -> [String] -> * -> Boolean
const isValidType = (fname, types, val) => {
  if      (anyValidType(val, types))             return true   // val's type is any of `types`
  else if (val != null && hasMethod(fname, val)) return true   // is `val` dispatchable?
  else                                           return false
}

//    validate :: UI -> Object -> Number -> * -> ()
const validate = curry((ui, fdoc, idx, val) => {
  const arg = getArg(fdoc, idx)
  debug(`checking ${quote(fdoc.name)}`, { idx, arg })

  if (arg == null)
    return debug(`warning: no doc for ${nthStr(idx)} argument of ${quote(fdoc.name)}`)

  if (not(isValidType(fdoc.name, arg.types, val))) {
    const err = new TypeError(formatTypeErrorMessage(fdoc, idx, val))
    ui.print(formatTypeError(ui, fdoc, idx, val, err))
    throw err
  }
})


//    setType :: (String, *) -> *
const setType = (type, val) =>
  Object.defineProperty(val, '@@type', {
    enumerable: false,
    value: `ramda/${type}`
  })

//    mapReturnValue :: Object -> * -> *
const mapReturnValue = curry((fdoc, val) =>
  propEq('returns', ['Lens'], fdoc) ? setType('Lens', val)
                                    : val)

//    wrapFunction :: UI -> [Object] -> Function -> String -> Function
const wrapFunction = curry((ui, docs, fn, name) => {
  const fdoc = find(propEq('name', name), docs)
  if (fdoc == null) {
    debug(`warning: no doc for function ${quote(name)}`)
    return fn
  } else {
    return specialCurryN(
      validate(ui, fdoc),
      mapReturnValue(fdoc),
      fn.length,
      [],
      fn
    )
  }
})

//    wrapRamda :: UI -> [Object] -> Object -> Object
const wrapRamda = curry((ui, docs, ramda) =>
  mapObjIndexed(when(isFunction, wrapFunction(ui, docs)),
                ramda))

module.exports = wrapRamda
