const { concat, join, pipe, repeat, toUpper } = require('ramda')
const { red } = require('chalk')
const strLen = require('string-length')

const TERM_COLUMNS = process.stdout.columns
const repeatStr = pipe(repeat, join(''))

const formatHeader = (str) => {
  const a = red('──') + ` ${red.bold(toUpper(str))} `
  const b = red(repeatStr('─', TERM_COLUMNS - strLen(a)))
  return concat(a, b)
}

module.exports = formatHeader
