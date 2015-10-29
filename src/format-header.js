const { concat, join, pipe, repeat, toUpper } = require('ramda')
const { red } = require('chalk')
const strLen = require('string-length')

const TERM_COLUMNS = process.stdout.columns
const repeatStr = pipe(repeat, join(''))

const formatHeader = (str) => {
  const left = red('──') + ` ${red.bold(toUpper(str))} `
  const rlen = TERM_COLUMNS - strLen(left)
  const right = red(repeatStr('─', rlen))
  return concat(left, right)
}

module.exports = formatHeader
