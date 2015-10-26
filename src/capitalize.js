const { concat, head, tail, toUpper } = require('ramda')

module.exports = (str) =>
  concat(toUpper(head(str)), tail(str))
