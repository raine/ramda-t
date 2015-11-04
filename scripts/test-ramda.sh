#!/usr/bin/env bash

# Runs with compiled code because using babel runtime has issues

set -e

if [ ! -d ../ramda/ ]; then
  git clone git@github.com:ramda/ramda.git ../ramda
fi

bad_tests=`cat scripts/bad-tests | paste -s -d"|" -`
(cd ../ramda && make clean && make)
cp ../ramda/dist/ramda.js node_modules/ramda/dist/ramda.js
./bin/generate-json ../ramda/dist/ramda.js ramda.json
sed -i '' "s/require('..\/..')/require('ramda')/" ../ramda/test/shared/*.js
sed -i '' "s/require('..')/require('..\/..\/ramda-t\/lib')/" ../ramda/test/*.js
./node_modules/.bin/mocha \
  --opts test/mocha-ramda.opts \
  --invert --grep "$bad_tests" \
  ../ramda/test/$1
