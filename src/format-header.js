const { concat, join, pipe, repeat, toUpper } = require('ramda')
const { red } = require('chalk')
const strLen = require('string-length')

const repeatStr = pipe(repeat, join(''))

const formatHeader = (columns, str) => {
  const left = red('──') + ` ${red.bold(toUpper(str))} `
  const rlen = columns - strLen(left)
  const right = red(repeatStr('─', rlen))
  return concat(left, right)
}

module.exports = formatHeader
