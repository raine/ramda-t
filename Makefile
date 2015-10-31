.PHONY: test

SRC = $(shell find src -name "*.js" -type f | sort)
LIB = $(patsubst src/%.js, lib/%.js, $(SRC))
NAME = $(shell node -e "console.log(require('./package.json').name)")
MOCHA = ./node_modules/.bin/mocha
BABEL = ./node_modules/.bin/babel
ESLINT = ./node_modules/.bin/eslint

.PHONY: test lint

default: all

lib:
	mkdir -p lib/

lib/%.js: src/%.js lib
	$(BABEL) "$<" > lib/$(notdir $<)

all: compile

compile: $(LIB) package.json

install: clean all
	npm install -g .

reinstall: clean
	$(MAKE) uninstall
	$(MAKE) install

uninstall:
	npm uninstall -g ${NAME}

dev-install: package.json
	npm install .

clean:
	rm -rf lib

publish: all test
	git push --tags origin HEAD:master
	npm publish

test:
	@$(MOCHA)

test-w:
	@$(MOCHA) -w

lint:
	@$(ESLINT) src/ test/
