
var spawn   = require('child_process').spawn
  , fs      = require('fs')
  , path    = require('path')
  , glob    = require('glob')
  , cwd     = path.resolve(__dirname)
  , uri     = path.resolve(cwd, 'server.uri')
  , couchjs = path.resolve(cwd, 'bin/couchjs');

var blacklist = [
    'script/test/attachments.js',
    'script/test/attachments_multipart.js',
    'script/test/attachment_names.js',
    'script/test/attachment_paths.js',
    'script/test/attachment_ranges.js',
    'script/test/attachment_views.js',
    'script/test/auth_cache.js',
    'script/test/basics.js',
    'script/test/batch_save.js',
    'script/test/bulk_docs.js',
    'script/test/changes.js',
    'script/test/coffee.js',
    'script/test/compact.js',
    'script/test/config.js',
    'script/test/conflicts.js',
    'script/test/content_negotiation.js',
    'script/test/cookie_auth.js',
    'script/test/delayed_commits.js',
    'script/test/design_docs.js',
    'script/test/design_options.js',
    'script/test/erlang_views.js',
    'script/test/etags_head.js',
    'script/test/etags_views.js',
    'script/test/form_submit.js',
    'script/test/http.js',
    'script/test/invalid_docids.js',
    'script/test/jsonp.js',
    'script/test/list_views.js',
    'script/test/method_override.js',
    'script/test/oauth.js',
    'script/test/oauth_users_db.js',
    'script/test/proxyauth.js',
    'script/test/purge.js',
    'script/test/reader_acl.js',
    'script/test/recreate_doc.js',
    'script/test/reduce.js',
    'script/test/reduce_builtin.js',
    'script/test/replication.js',
    'script/test/replicator_db.js',
    'script/test/replicator_db_security.js',
    'script/test/rev_stemming.js',
    'script/test/rewrite.js',
    'script/test/security_validation.js',
    'script/test/show_documents.js',
    'script/test/stats.js',
    'script/test/update_documents.js',
    'script/test/users_db.js',
    'script/test/users_db_security.js',
    'script/test/uuids.js',
    'script/test/view_collation.js',
    'script/test/view_collation_raw.js',
    'script/test/view_compaction.js',
    'script/test/view_errors.js',
    'script/test/view_include_docs.js',
    'script/test/view_multi_key_all_docs.js',
    'script/test/view_multi_key_design.js',
    'script/test/view_multi_key_temp.js',
    'script/test/view_offsets.js',
    'script/test/view_pagination.js',
    'script/test/view_sandboxing.js',
    'script/test/view_update_seq.js',
    'script/test/view_xml.js'
  ];

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

    tests = tests.filter(function(test) {
      return blacklist.indexOf(test) === -1;
    });

    console.log('testing: %s', tests.join('\n'));
    console.log('skipping: %s', blacklist.join('\n'));

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

