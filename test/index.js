const { add, identity, multiply } = require('ramda')
const R = require('ramda')
const { eq, assert } = require('./utils')
const { doesNotThrow, throws } = assert
const sinon = require('sinon')
const wrap = require('../src/wrap-ramda')

const noop = () => {}

it('handles any type (*)', () => {
  const docs = [{
    args: [ { types: [ '*' ] } ],
    name: 'empty'
  }]
  
  const { empty } = wrap(noop, docs, R)

  doesNotThrow(() => {
    empty('foo')
    empty([])
    empty(1)
  })
})

it('handles multiple types', () => {
  const docs = [{
    args: [ { types: [ 'String', 'Array' ] } ],
    name: 'reverse'
  }]
  
  const { reverse } = wrap(noop, docs, R)

  doesNotThrow(() => {
    reverse('foo')
    reverse([])
  })

  throws(() => reverse(1))
})

it('handles variadic functions', () => {
  const docs = [{
    args: [{
      variable: true,
      types: ['Function']
    }],
    name: 'pipe'
  }]
  
  const { pipe } = wrap(noop, docs, R)

  doesNotThrow(() => {
    eq(pipe(add(1), multiply(2))(1), 4)
  })

  throws(() => pipe(identity, 1))
})

it('checks if a value is dispatchable if type does not match', () => {
  const docs = [{
    args: [
      { types: ['Function'] },
      { types: ['Array'] }
    ],
    name: 'map'
  }]
  
  const { map } = wrap(noop, docs, R)

  doesNotThrow(() => map(identity, { map: noop }))
  throws(() => map(identity, { foo: noop }))
})

it('throws when passing an undefined to trigger invalid type', () => {
  const docs = [{
    args: [ { types: [ 'Array' ] } ],
    name: 'head'
  }]
  
  const { head } = wrap(noop, docs, R)
  throws(() => head(undefined))
})

it('calls passed print function on invalid type', () => {
  const docs = [{
    args: [ { types: [ 'Array' ] } ],
    name: 'head'
  }]

  const print = sinon.spy()
  const { head } = wrap(print, docs, R)

  throws(() => head(undefined))
  sinon.assert.called(print)
})
