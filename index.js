#! /usr/bin/env node
'use strict';
var github = require('octonode');
var PouchDB = require('pouchdb');
var uuid = require('uuidv4');

function printHelp() {

}

function handleError(error) {
  console.log(error);
}

function createDatabaseName(identifier) {
  return identifier.split("/")[1];
}

function saveToDatabase(databaseName, issues) {
  var db = new PouchDB(databaseName);
  return Promise.all(issues.map(function(issue) {
    var doc = Object.assign({'_id': uuid() }, issue);
    return db.put(doc);
  }))
  .catch(function(err) {
    console.log("ERR", err);
  });
}

function printDocuments(docs) {
  docs.forEach(function(doc) {
    console.log(doc);
  });
}

function fetchDocuments(databaseName) {
  var db = new PouchDB(databaseName);
  return db.allDocs({
    include_docs: true
  });
}

function fetchFromGitHub(repoId) {
  var client = github.client();
  var ghrepo = client.repo(repoId);
  ghrepo.issues(function(err, issues) {
    if(err) {
      handleError(err);
      return;
    }

    saveToDatabase(createDatabaseName(repositoryName), issues);
  });
}

var userArgs = process.argv.slice(2);
var repositoryName = userArgs[0];
if(!repositoryName) {
  console.log("Repository name is missing");
  printHelp();
  process.exit(1);
}

var dbName = createDatabaseName(repositoryName);
fetchDocuments(dbName).then(function(resultSet) {
  if (resultSet.total_rows > 0) {
    console.log('documents from database');
    printDocuments(resultSet.rows);
    return Promise.resolve();
  } else {
    console.log('documents from github');
    return fetchFromGitHub(repositoryName);
  }
})
.catch(function(err) {
  console.log("ERR", err);
});
