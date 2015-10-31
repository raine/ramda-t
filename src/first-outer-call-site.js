const callsites = require('error-callsites')
const isMyCallSite = require('./is-my-call-site')
const { anyPass, complement, curry, find, invoker, pipe } = require('ramda')

const getFileName = invoker(0, 'getFileName')
const includes = curry((x, str) => str.indexOf(x) >= 0)
const isRamdaSourceFile =
  pipe(getFileName, includes('node_modules/ramda/dist/ramda.js'))

const firstOuterCallSite =
  pipe(callsites, find(complement(anyPass([
    isMyCallSite,
    isRamdaSourceFile
  ]))))

module.exports = firstOuterCallSite
