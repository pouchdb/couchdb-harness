
var spawn   = require('child_process').spawn
  , fs      = require('fs')
  , path    = require('path')
  , glob    = require('glob')
  , cwd     = path.resolve(__dirname)
  , uri     = path.resolve(cwd, 'server.uri')
  , couchjs = path.resolve(cwd, 'bin/couchjs');

module.exports = {

  run: function (port, tests, callback) {
    
    // The couchjs binary file will fail if the server.uri file doesn't
    // have a linebreak at the end.
    var addr = 'http://127.0.0.1:' + (port || 5984) + '/\n'
      , files;

    tests = (!!tests && tests.length)
      ? tests.map(function (test) { 
          return 'script/test/' + test + '.js';
        })
      : glob.sync('script/test/*.js', { cwd: cwd });

    files = [
      'script/json2.js',
      'script/sha1.js',
      'script/oauth.js',
      'script/couch.js',
      'script/couch_test_runner.js',
      'script/couch_tests.js'
    ].concat(tests, [
      'util/couch_http.js',
      'util/cli_runner.js'
    ]).map(function (fp) {
      return path.resolve(cwd, fp);
    });

    fs.writeFile(uri, addr, { encoding: 'utf8' }, function (err) {
      if (err) throw err;
      var tests = spawn(couchjs, ['-H', '-u', uri].concat(files));

      tests.stdout.on('data', function (data) {
        process.stdout.write(data);
      });

      tests.stderr.on('data', function (data) {
        process.stdout.write(data);
      });

      tests.on('exit', function (code) {
        callback.call(null, code);
      });
    });

  }

};

