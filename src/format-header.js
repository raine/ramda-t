const { join, pipe, repeat, toUpper } = require('ramda')
const { red, dim } = require('chalk')
const strLen = require('string-length')

const repeatStr = pipe(repeat, join(''))

const formatHeader = (columns, title, rightText) => {
  const left = red('──') + ` ${red.bold(toUpper(title))} `
  const right = ` ${dim(rightText)}`
  const lineLen = columns - strLen(left) - strLen(right)
  const line = red(repeatStr('─', lineLen))
  return left + line + right
}

module.exports = formatHeader
