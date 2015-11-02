const { anyPass, curry, equals, invoker, pipe, reject } = require('ramda')
const path = require('path')
const isMyCallSite = require('./is-my-call-site');
const debug = require('debug')('ramda-t')
const wrapRamda = require('./wrap-ramda');
const stackChain = require('stack-chain')

const writeLn = curry((stream, str) => stream.write(str + '\n'))
const mainRamda = require.main.require('ramda')
const mainRamdaVersion = require.main.require('ramda/package.json').version
const PACKAGE_ROOT = path.resolve(__dirname, '..')
const JSON_DOCS = path.join(PACKAGE_ROOT, 'ramda.json')
const docs = require(JSON_DOCS)

const ui = {
  print: writeLn(process.stderr),
  process
}

module.exports = wrapRamda(ui, docs, mainRamda)
module.exports.__ = mainRamda.__ // ^ loses this

const getFileName = invoker(0, 'getFileName')
const isStackNoise = anyPass([
  isMyCallSite,
  pipe(getFileName, equals('module.js'))
])

stackChain.filter.attach((err, frames) => {
  if (err.__declutterStackTrace) {
    return reject(isStackNoise, frames)
  } else {
    return frames
  }
})

Error.stackTraceLimit = 20

debug('ramda-t package root', PACKAGE_ROOT)
debug('reading docs json from path', JSON_DOCS)
debug('ramda version', mainRamdaVersion)
