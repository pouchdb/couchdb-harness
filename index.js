"use strict";

var spawn   = require('child_process').spawn,
    fs      = require('fs'),
    path    = require('path'),
    glob    = require('glob'),
    colors  = require('colors/safe'),
    which   = require('which'),
    cwd     = path.resolve(__dirname),
    uri     = path.resolve(cwd, 'server.uri');

var couchjs;
try {
  couchjs = which.sync('couchjs');
} catch (err) {
  couchjs = path.resolve(cwd, 'bin/couchjs');
}

var blacklist = [
    'javascript/tests/attachment_ranges.js',
    'javascript/tests/attachments_multipart.js',
    'javascript/tests/auth_cache.js',
    'javascript/tests/batch_save.js',
    'javascript/tests/coffee.js',
    'javascript/tests/conflicts.js',
    'javascript/tests/delayed_commits.js',
    'javascript/tests/design_docs.js',
    'javascript/tests/design_options.js',
    'javascript/tests/erlang_views.js',
    'javascript/tests/etags_views.js',
    'javascript/tests/form_submit.js',
    'javascript/tests/http.js',
    'javascript/tests/invalid_docids.js',
    'javascript/tests/jsonp.js',
    'javascript/tests/method_override.js',
    'javascript/tests/oauth_users_db.js',
    'javascript/tests/proxyauth.js',
    'javascript/tests/purge.js',
    'javascript/tests/recreate_doc.js',
    'javascript/tests/reduce_builtin.js',
    'javascript/tests/reduce.js',
    'javascript/tests/replication.js',
    'javascript/tests/replicator_db_by_doc_id.js',
    'javascript/tests/replicator_db_credential_delegation.js',
    'javascript/tests/replicator_db_filtered.js',
    'javascript/tests/replicator_db_invalid_filter.js',
    'javascript/tests/replicator_db_security.js',
    'javascript/tests/replicator_db_successive.js',
    'javascript/tests/replicator_db_user_ctx.js',
    'javascript/tests/rev_stemming.js',
    'javascript/tests/stats.js',
    'javascript/tests/users_db_security.js',
    'javascript/tests/view_collation.js',
    'javascript/tests/view_collation_raw.js',
    'javascript/tests/view_compaction.js',
    'javascript/tests/view_errors.js',
    'javascript/tests/view_include_docs.js',
    'javascript/tests/view_multi_key_all_docs.js',
    'javascript/tests/view_multi_key_design.js',
    'javascript/tests/view_multi_key_temp.js',
    'javascript/tests/view_offsets.js',
    'javascript/tests/view_pagination.js',
    'javascript/tests/view_sandboxing.js',
    'javascript/tests/view_update_seq.js'
  ];

module.exports = {

  run: function (addr, opts, callback) {
    // parse args
    if (typeof addr === 'function') {
      callback = addr;
      addr = null;
    } else if (typeof addr === 'object' && addr !== null) {
      opts = addr;
      addr = null;
    } else if (typeof addr === 'number') {
      addr = 'http://127.0.0.1:' + addr + '/';
    }
    // The couchjs binary file will fail if the server.uri file doesn't
    // have a linebreak at the end.
    addr = (addr || 'http://127.0.0.1:5984/') + '\n';

    if (typeof opts === 'function') {
      callback = opts;
      opts = null;
    }
    opts = opts || {};
    if (Array.isArray(opts)) {
      opts = {tests: opts};
    }
    if (opts.tests && opts.tests.length) {
      opts.tests = opts.tests.map(function (test) {
        return 'javascript/tests/' + test + '.js';
      });
    } else {
      opts.tests = glob.sync('javascript/tests/*.js', {cwd: cwd});
    }
    callback = callback || function () {};

    // filter tests by black list
    var skipping = opts.tests.filter(function (test) {
      return blacklist.indexOf(test) !== -1;
    });
    opts.tests = opts.tests.filter(function(test) {
      return blacklist.indexOf(test) === -1;
    });
    if (skipping.length) {
      console.log(colors.cyan('skipping:\n') + skipping.join('\n'));
    }
    fs.writeFile(uri, addr, {encoding: 'utf8'}, function (err) {
      runTests(opts, callback);
    });
  }
};

function runTests(opts, cb, code) {
  if (!opts.tests.length || (opts.bail && code)) {
    return cb(code);
  }
  var test = opts.tests.shift();
  runTest(test, function (newCode) {
    runTests(opts, cb, code || newCode);
  });
}

function runTest(test, cb) {
  console.log('\n' + test + ': ' + colors.cyan('starting'));
  var files = [
    'couchdb-harness-extra.js',
    'javascript/json2.js',
    'javascript/sha1.js',
    'javascript/oauth.js',
    'javascript/couch.js',
    'javascript/replicator_db_inc.js',
    'javascript/couch_test_runner.js',
    'javascript/couch_http.js',
    'javascript/test_setup.js',
    test,
    'javascript/cli_runner.js'
  ].map(function (fp) {
    return path.resolve(cwd, fp);
  });
  var cmd = spawn(couchjs, ['-H', '-u', uri].concat(files));

  cmd.stdout.on('data', function (data) {
    process.stdout.write(colors.grey(data));
  });

  cmd.stderr.on('data', function (data) {
    process.stdout.write(data);
  });

  cmd.on('exit', function (code) {
    var message = code ? colors.red('fail') : colors.green('pass');
    console.log(test + ': ' + message);
    return cb(code);
  });
}
