const { curry, join, reject, split, test } = require('ramda')

const around = curry((fore, hind, fn, x) =>
  hind(fn(fore(x))))

const aroundLines = around(split('\n'), join('\n'))

const filterStack = curry((pat, stack) =>
  aroundLines(reject(test(new RegExp(`\\b${pat}\\b`))), stack))

module.exports = filterStack
