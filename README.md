# ramda-t

Experiment: Primitive, JSDoc-assisted type checking for Ramda

## usage

1. `npm install ramda-t` in a project that uses Ramda
2. Use `require('ramda-t')` in place of `require('ramda')`

## caveats

- Relies on JSDoc `@params` annotations to be correct.
- `R.map`'s second argument is type of `Array`. Becomes an issue when `R.map`
  is used to dispatch. Dispatched arguments are difficult to parse from JSDoc
  annotations because they're part of the description.
