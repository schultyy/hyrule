#! /usr/bin/env node
'use strict';
var github = require('octonode');
var db = require('./lib/database_client');
var ui = require('./lib/ui');

function printHelp() {

}

function handleError(error) {
  console.log(error);
}

function printDocuments(docs) {
  ui.render(docs.map(function(doc) {
    return doc.doc;
  }));
}

function fetchFromGitHub(repoId) {
  var client = github.client();
  var ghrepo = client.repo(repoId);
  ghrepo.issues(function(err, issues) {
    if(err) {
      handleError(err);
      return;
    }

    db.saveToDatabase(db.createDatabaseName(repositoryName), issues);
  });
}

var userArgs = process.argv.slice(2);
var repositoryName = userArgs[0];
if(!repositoryName) {
  console.log("Repository name is missing");
  printHelp();
  process.exit(1);
}

var dbName = db.createDatabaseName(repositoryName);
db.fetchDocuments(dbName).then(function(resultSet) {
  if (resultSet.total_rows > 0) {
    printDocuments(resultSet.rows);
    return Promise.resolve();
  } else {
    return fetchFromGitHub(repositoryName);
  }
})
.catch(function(err) {
  console.log("ERR", err);
});
