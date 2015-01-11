# CouchDB Harness

>A generalized port of the CouchDB JavaScript test harness.

## Install

```
npm install couchdb-harness
```

## Usage

### Command Line

To run the default configuration, you can simply type,

```
$ npm start
```

But the binary also accepts arguments to specify the port that the harness
should run against, as well as which files to test:

```bash
./bin/couchdb-harness -p 5984 basics all_docs
```

#### Available options
- ``-b``: bail (a flag)
- ``-a``: address
- ``-p``: port

All options are further described below.

### Node.js

#### Examples

```javascript
var harness = require('couchdb-harness');
harness.run(5984, ['basics', 'all_docs'], function (exitCode) {
  process.exit(exitCode);
});
```

```javascript
var harness = require('couchdb-harness');
harness.run('http://192.168.1.31:5985/', {bail: true}, function (code) {
  process.exit(code);
})
```

#### API

``harness.run([addr[, opts[, callback]]])``

- ``addr``: The address of the server with a CouchDB-style API to test.
  Defaults to ``"http://127.0.0.1:5984/"``. If the server you want to
  test runs on localhost and you just want to change the port, you can
  also just pass in the port number instead.
- ``opts``: Either an array of tests as demonstrated in the first
  example, or a JavaScript object with the following (optional)
  properties:
  - ``tests``: The aforementioned array of tests. Defaults to all the
    test files.
  - ``bail``: When ``true``, couchdb-harness will stop running on the
    first failure it encounters. This does not have any influence on the
    ``exitCode``. One failure is still enough to make it non-zero.
    Defaults to ``false``.
  - ``callback``: Called when done running the tests. Gets one argument:
    the exit code. It's zero when the tests all passed, otherwise
    non-zero.

## License

Copyright 2013 Nick Thompson

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
