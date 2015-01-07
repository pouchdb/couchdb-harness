
var spawn   = require('child_process').spawn
  , fs      = require('fs')
  , path    = require('path')
  , glob    = require('glob')
  , cwd     = path.resolve(__dirname)
  , uri     = path.resolve(cwd, 'server.uri')
  , couchjs = path.resolve(cwd, 'bin/couchjs');

var blacklist = [
    'script/tests/attachments.js',
    'script/tests/attachments_multipart.js',
    'script/tests/attachment_names.js',
    'script/tests/attachment_paths.js',
    'script/tests/attachment_ranges.js',
    'script/tests/auth_cache.js',
    'script/tests/batch_save.js',
    'script/tests/bulk_docs.js',
    'script/tests/coffee.js',
    'script/tests/compact.js',
    'script/tests/config.js',
    'script/tests/conflicts.js',
    'script/tests/cookie_auth.js',
    'script/tests/delayed_commits.js',
    'script/tests/design_docs.js',
    'script/tests/design_options.js',
    'script/tests/erlang_views.js',
    'script/tests/etags_views.js',
    'script/tests/form_submit.js',
    'script/tests/http.js',
    'script/tests/invalid_docids.js',
    'script/tests/jsonp.js',
    'script/tests/list_views.js',
    'script/tests/method_override.js',
    'script/tests/oauth.js',
    'script/tests/oauth_users_db.js',
    'script/tests/proxyauth.js',
    'script/tests/purge.js',
    'script/tests/reader_acl.js',
    'script/tests/recreate_doc.js',
    'script/tests/reduce.js',
    'script/tests/reduce_builtin.js',
    'script/tests/replication.js',
    'script/tests/replicator_db_bad_rep_id.js',
    'script/tests/replicator_db_by_doc_id.js',
    'script/tests/replicator_db_compact_rep_db.js',
    'script/tests/replicator_db_continuous.js',
    'script/tests/replicator_db_credential_delegation.js',
    'script/tests/replicator_db_field_validation.js',
    'script/tests/replicator_db_filtered.js',
    'script/tests/replicator_db_identical.js',
    'script/tests/replicator_db_identical_continuous.js',
    'script/tests/replicator_db_invalid_filter.js',
    'script/tests/replicator_db_simple.js',
    'script/tests/replicator_db_successive.js',
    'script/tests/replicator_db_survives.js',
    'script/tests/replicator_db_swap_rep_db.js',
    'script/tests/replicator_db_update_security.js',
    'script/tests/replicator_db_user_ctx.js',
    'script/tests/replicator_db_write_auth.js',
    'script/tests/rev_stemming.js',
    'script/tests/rewrite.js',
    'script/tests/security_validation.js',
    'script/tests/show_documents.js',
    'script/tests/stats.js',
    'script/tests/update_documents.js',
    'script/tests/users_db.js',
    'script/tests/users_db_security.js',
    'script/tests/uuids.js',
    'script/tests/view_collation.js',
    'script/tests/view_collation_raw.js',
    'script/tests/view_compaction.js',
    'script/tests/view_errors.js',
    'script/tests/view_include_docs.js',
    'script/tests/view_multi_key_all_docs.js',
    'script/tests/view_multi_key_design.js',
    'script/tests/view_multi_key_temp.js',
    'script/tests/view_offsets.js',
    'script/tests/view_pagination.js',
    'script/tests/view_sandboxing.js',
    'script/tests/view_update_seq.js',
    'script/tests/view_xml.js'
  ];

module.exports = {

  run: function (port, tests, callback) {
    
    // The couchjs binary file will fail if the server.uri file doesn't
    // have a linebreak at the end.
    var addr = 'http://127.0.0.1:' + (port || 5984) + '/\n'
      , files;

    tests = (!!tests && tests.length)
      ? tests.map(function (test) { 
          return 'script/tests/' + test + '.js';
        })
      : glob.sync('script/tests/*.js', { cwd: cwd });

    tests = tests.filter(function(test) {
      return blacklist.indexOf(test) === -1;
    });

    console.log('testing:\n%s\n', tests.join('\n'));
    console.log('skipping:\n%s\n', blacklist.join('\n'));

    files = [
      'script/json2.js',
      'script/sha1.js',
      'script/oauth.js',
      'script/couch.js',
      'script/replicator_db_inc.js',
      'script/couch_test_runner.js',
      'script/couch_http.js',
      'script/test_setup.js'
    ].concat(tests, [
      'script/cli_runner.js'
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

