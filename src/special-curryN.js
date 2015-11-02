var _arity = require('./arity');

module.exports = function _curryN(tapArg, resultThunk, length, received, fn) {
  return function() {
    var combined = [];
    var argsIdx = 0;
    var left = length;
    var combinedIdx = 0;
    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;
      if (combinedIdx < received.length &&
          (received[combinedIdx] == null ||
           received[combinedIdx]['@@functional/placeholder'] !== true ||
           argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }

      combined[combinedIdx] = result;
      if (result == null || result['@@functional/placeholder'] !== true) {
        tapArg(result, combinedIdx)
        left -= 1;
      }
      combinedIdx += 1;
    }
    return left <= 0
      ? resultThunk(combined, function() {
          return fn.apply(this, combined)
        })
      : _arity(left, _curryN(tapArg, resultThunk, length, combined, fn));
  };
};
