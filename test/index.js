const { add, always, assoc, identity, multiply } = require('ramda')
const R = require('ramda')
const { eq, assert } = require('./utils')
const { doesNotThrow, throws } = assert
const sinon = require('sinon')
const noop = () => {}
const wrapRamda = require('../src/wrap-ramda')
const baseUI = {
  process: {
    cwd: always(process.env.HOME),
    stdout: { columns: 30 }
  },
  print: noop
}

const wrap = wrapRamda(baseUI)

it('reports correct arity', () => {
  const docs = [{
    args: [ { types: [ '*' ] } ],
    name: 'empty'
  }]

  const { empty } = wrap(docs, R)
  eq(empty.length, R.empty.length)
})

// TODO: elaborate thrown error's messages
it('handles any type (*)', () => {
  const docs = [{
    args: [ { types: [ '*' ] } ],
    name: 'empty'
  }]

  const { empty } = wrap(docs, R)

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

  const { reverse } = wrap(docs, R)

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

  const { pipe } = wrap(docs, R)

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

  const { map } = wrap(docs, R)

  doesNotThrow(() => map(identity, { map: noop }))
  throws(() => map(identity, { foo: noop }))
})

it('throws when passing an undefined to trigger invalid type', () => {
  const docs = [{
    args: [ { types: [ 'Array' ] } ],
    name: 'head'
  }]

  const { head } = wrap(docs, R)
  throws(() => head(undefined))
})

it('calls passed print function on invalid type', () => {
  const docs = [{
    args: [ { types: [ 'Array' ] } ],
    name: 'head'
  }]

  const print = sinon.spy()
  const ui = assoc('print', print, baseUI)
  const { head } = wrapRamda(ui, docs, R)
  throws(() => head(undefined))
  sinon.assert.called(print)
})

it('sets @@type property for functions that return a Lens', () => {
  const docs = [{
    args: [ { types: [ 'Number' ] } ],
    name: 'lensIndex',
    returns: ['Lens']
  }]

  const { lensIndex } = wrap(docs, R)
  eq(lensIndex(0)['@@type'], 'ramda/Lens')
})

it('handles Lens type (which really is a function) as argument', () => {
  const docs = [{
    args: [ { types: [ 'Number' ] } ],
    name: 'lensIndex',
    returns: ['Lens']
  }, {
    args: [
      { types: [ 'Lens' ] } ,
      { types: [ '*' ] }
    ],
    name: 'view',
    returns: ['*']
  }]

  const { lensIndex, view } = wrap(docs, R)
  const headLens = lensIndex(0)
  eq(view(headLens, [1, 2, 3]), 1)
})
