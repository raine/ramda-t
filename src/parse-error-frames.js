const parsetrace = require('parsetrace')
const { pipe, prop } = require('ramda')

const parseErrorTrace = 
  pipe(parsetrace,
       (x) => x.object(),
       prop('frames'))

module.exports = parseErrorTrace
