#!/usr/bin/env bash

# Runs with compiled code because using babel runtime has issues

set -e

if [ ! -d ../ramda/ ]; then
  git clone git@github.com:ramda/ramda.git ../ramda
fi

(cd ../ramda && git clean -fd && git reset --hard && git checkout v0.18.0)
rm ../ramda/dist/ramda.js
rm ../ramda/test/transduce.js
sed -i '' "s/require('..\/..')/require('ramda')/" ../ramda/test/shared/*.js
sed -i '' "s/require('..')/require('..\/..\/ramda-t\/lib')/" ../ramda/test/*.js
./node_modules/.bin/mocha \
  --opts test/mocha-ramda.opts \
  --invert --grep 'throws|terminates' \
  ../ramda/test/$1
