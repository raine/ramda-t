const S = require('sanctuary')
const isMyFile = require('./is-my-file')
const parseErrorFrames = require('./parse-error-frames');
const { anyPass, complement, curry, pipe, propSatisfies } = require('ramda')

const includes = curry((x, str) => str.indexOf(x) >= 0)
const isRamdaSourceFile = includes('node_modules/ramda/dist/ramda.js')

//    firstOuterCallSite :: Error -> Object
const firstOuterCallSite =
  pipe(parseErrorFrames,
       S.find(complement(anyPass([
         propSatisfies(isMyFile, 'file'),
         propSatisfies(isRamdaSourceFile, 'file')
       ]))))

module.exports = firstOuterCallSite
