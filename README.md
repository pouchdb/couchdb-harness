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
should run against, as well as which files to test,

```
./bin/couchdb-harness -p 5984 basics all_docs
```

### Node.js

```
var harness = require('couchdb-harness');
harness.run(5984, ['basics', 'all_docs'], function (exitCode) {
  process.exit(exitCode);
});
```

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
