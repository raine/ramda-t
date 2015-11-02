# ramda-t [![npm version](https://badge.fury.io/js/ramda-t.svg)](https://www.npmjs.com/package/ramda-t)

> Experiment: Primitive, JSDoc-assisted runtime type checking for [Ramda][ramda]

It reads JSDoc documentation from the project's Ramda source file and uses
the functions' `@param` annotations to determine valid argument types in
function application.

## features

- Throws a `TypeError` when passing values of incorrect type to Ramda
  functions

## usage

1. `npm install ramda-t` in a project that has `ramda` installed.
2. Require `ramda-t` instead of `ramda`.

## example

```js
var R = require('ramda-t');
var doubleAll = R.map(R.multiply(2));
doubleAll('foo'); // oops
```

<img src="https://raw.githubusercontent.com/raine/ramda-t/media/example.png" width="416" height="315">

## issues

- [x] ~~Lens value types are documented as `Lens`, despite being type of `Function`~~
- [ ] How to smoothly make `ramda-t` part of development process but drop
      for production use?
- [ ] `R.reject` takes `@param Object` as second argument, and dispatches to
      `filter`, a method of a different name than the function itself.

## caveats

- Relies on JSDoc `@param` annotations to be correct. Some may not be.
  The generated `ramda.json` may be edited to correct types.
- `R.map`'s second argument is type of `Array`. Becomes an issue when `R.map`
  is used to dispatch. Dispatched arguments are difficult to parse from JSDoc
  annotations because they're part of the description. Workaround: Check if
  value is dispatchable, i.e. has a method by the name of the function.

## running ramda test suite with `ramda-t`

```sh
./scripts/test-ramda.sh
./scripts/test-ramda.sh propEq.js
```

## debug output

Set `DEBUG` environment variable to `ramda-t`.

```sh
DEBUG=ramda-t node index.js
```

[ramda]: http://ramdajs.com
