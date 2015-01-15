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
    'javascript/tests/oauth.js',
    'javascript/tests/oauth_users_db.js',
    'javascript/tests/proxyauth.js',
    'javascript/tests/purge.js',
    'javascript/tests/reader_acl.js',
    'javascript/tests/recreate_doc.js',
    'javascript/tests/reduce_builtin.js',
    'javascript/tests/reduce.js',
    'javascript/tests/replication.js',
    'javascript/tests/replicator_db_by_doc_id.js',
    'javascript/tests/replicator_db_compact_rep_db.js',
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

  run: function (port, tests, callback) {
    
    // The couchjs binary file will fail if the server.uri file doesn't
    // have a linebreak at the end.
    var addr = 'http://127.0.0.1:' + (port || 5984) + '/\n';

    if (tests && tests.length) {
      tests = tests.map(function (test) { 
        return 'javascript/tests/' + test + '.js';
      });
    } else {
      tests = glob.sync('javascript/tests/*.js', { cwd: cwd });
    }

    tests = tests.filter(function(test) {
      return blacklist.indexOf(test) === -1;
    });

    console.log(colors.cyan('skipping:\n') + blacklist.join('\n') + '\n');

    function runTests(tests, cb, code) {
      if (code) {
        return cb(code);
      }
      if (!tests.length) {
        return cb(null, 0);
      }
      var test = tests.shift();
      console.log(colors.green("\nStarting " + test));
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
        runTests(tests, cb, code);
      });
    }

    fs.writeFile(uri, addr, { encoding: 'utf8' }, function (err) {
      if (err) {
        throw err;
      }

      runTests(tests, callback);
    });

  }

};

