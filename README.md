# ramda-t

Experiment: Primitive, JSDoc-assisted runtime type checking for Ramda

It reads JSDoc documentation from the project's Ramda and uses the functions'
`@param` annotations to determine valid argument types in function
application.

## usage

1. `npm install ramda-t` in a project that uses Ramda.
2. Require `ramda-t` in place of `ramda`.

## example

```js
var R = require('ramda-t');
var doubleAll = R.map(R.multiply(2));
doubleAll('foo');
```

<img src="https://raw.githubusercontent.com/raine/ramda-t/media/example.png" width="416" height="315">

## debug output

Set `DEBUG` environment variable to `ramda-t`.

```sh
DEBUG=ramda-t node index.js
```

## caveats

- Relies on JSDoc `@param` annotations to be correct.
- `R.map`'s second argument is type of `Array`. Becomes an issue when `R.map`
  is used to dispatch. Dispatched arguments are difficult to parse from JSDoc
  annotations because they're part of the description. Workaround: Check if
  value has a method by the name of the function.
