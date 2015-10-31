const callsites = require('error-callsites')
const isMyCallSite = require('./is-my-call-site')
const { anyPass, complement, curry, invoker, pipe } = require('ramda')
const S = require('sanctuary')

const getFileName = invoker(0, 'getFileName')
const includes = curry((x, str) => str.indexOf(x) >= 0)
const isRamdaSourceFile =
  pipe(getFileName, includes('node_modules/ramda/dist/ramda.js'))

const firstOuterCallSite =
  pipe(callsites,
       S.find(complement(anyPass([
         isMyCallSite,
         isRamdaSourceFile
       ]))))

module.exports = firstOuterCallSite
