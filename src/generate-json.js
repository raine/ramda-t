const fs = require('fs')
const parse = require('jsdoc-parse')
const concatStream = require('concat-stream')
const { __, allPass, assoc, concat, curry, filter, find, head, map, path, pick, pipe, project, prop, propEq, propOr, tail, toString, toUpper, unary } = require('ramda')

const capitalize = (str) =>
  concat(toUpper(head(str)), tail(str))

//    propFromObj :: k -> (Object -> v) -> Object
const propFromObj = curry((key, fn, obj) =>
  assoc(key, fn(obj), obj))

const parseJSON = unary(JSON.parse)
const stringifyJSON = curry(JSON.stringify)(__, null, 2)

const isRamdaFunction = allPass([
  propEq('kind', 'function'),
  propEq('memberof', 'R')
])

const argsFromParams =
  pipe(propOr([], 'params'),
       map(pipe(propFromObj('types', pipe(path(['type', 'names']),
                                          map(capitalize))),
                pick(['name', 'types', 'variable']))))

const returnsFromParams =
  pipe(propOr([], 'returns'),
       head,
       path(['type', 'names']),
       map(capitalize))

const sigFromTags =
  pipe(prop('customTags'),
       find(propEq('tag', 'sig')),
       prop('value'))

//    makeDocs :: Buffer -> [Object]
const makeDocs =
  pipe(filter(isRamdaFunction),
       map(pipe(propFromObj('sig', sigFromTags),
                propFromObj('args', argsFromParams),
                propFromObj('returns', returnsFromParams))),
       project([ 'args', 'name', 'returns', 'sig', 'description' ]))

const writeFile = curry(fs.writeFileSync)

module.exports = (process) => {
  const [input, output] = process.argv.slice(2)

  parse({ src: input })
    .pipe(concatStream(pipe(
      toString,
      parseJSON,
      makeDocs,
      stringifyJSON,
      writeFile(output, __, 'utf8')
    )))
}
