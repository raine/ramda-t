const { __, addIndex, contains, curry, filter, flip, join, map, max, min, pair, range, split } = require('ramda')
const cardinal = require('cardinal')
const fs = require('fs')
const chalk = require('chalk')

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

const CONTEXT = 3
const readCallSiteContext = (site) => {
  const idx = site.line - 1
  const content = readFileUtf8(site.file)
  // TODO: don't highlight without tty
  const highlighted = cardinal.highlight(content, { linenos: true })
  const indexedLines = indexList(lines(highlighted))
  return pickIndexes(aroundIdx(CONTEXT, idx, indexedLines), indexedLines)
}

const formatLines = (ls, targetLineIdx) =>
  map(([lineIdx, line]) => {
    const isTargetLine = targetLineIdx === lineIdx
    const prefix = isTargetLine ? '>' : ' '
    return unwords([
      ' ', prefix, chalk.reset(line)
    ])
  }, ls)

const renderCallSite = (site) => {
  const errLineIdx = site.line - 1
  const contextLines = readCallSiteContext(site)
  return formatLines(contextLines, errLineIdx)
}

module.exports = renderCallSite
