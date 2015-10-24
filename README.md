# ramda-t

## caveats

- `R.map`'s second argument is type of `Array`. Becomes an issue when `R.map`
  is used to dispatch. Dispatched arguments are difficult to parse from JSDoc
  annotations because they're part of the description.
