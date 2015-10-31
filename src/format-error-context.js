const { __, addIndex, contains, curry, filter, flip, invoker, join, map, max, min, pair, pipe, range, split } = require('ramda')
const cardinal = require('cardinal')
const fs = require('fs')
const chalk = require('chalk')
const firstOuterCallSite = require('./first-outer-call-site');

const getFileName = invoker(0, 'getFileName')
const lines = split('\n')
const unwords = join(' ')
const mapIndexed = addIndex(map)
const indexList = mapIndexed(flip(pair))
const filterIndexed = addIndex(filter)

const readFileUtf8 = curry(fs.readFileSync)(__, 'utf8')

const pickIndexes = curry((idxs, arr) =>
  filterIndexed((val, idx) => contains(idx, idxs), arr))

//    aroundIdx ::  Number -> Number -> [a] -> [a]
const aroundIdx = curry((c, n, arr) =>
  range(max(0, n - c), min(arr.length, n + c + 1)))

const readCallSiteFile =
  pipe(getFileName, readFileUtf8)

const readCallSiteContext = (site) => {
  const idx = site.getLineNumber() - 1
  const content = readCallSiteFile(site)
  const highlighted = cardinal.highlight(content, { linenos: true })
  const fileLines = indexList(lines(highlighted))
  return pickIndexes(aroundIdx(1, idx, fileLines), fileLines)
}

const formatLines = (ls, targetLineIdx) =>
  map(([lineIdx, line]) => {
    const isTargetLine = targetLineIdx === lineIdx
    const prefix = isTargetLine ? '>' : ' '
    return unwords([
      ' ', prefix, chalk.reset(line)
    ])
  }, ls)

const formatErrorContext = (err) => {
  const site = firstOuterCallSite(err)
  if (site == null) return []
  const errLineIdx = site.getLineNumber() - 1
  const contextLines = readCallSiteContext(site)
  return formatLines(contextLines, errLineIdx)
}

module.exports = formatErrorContext
