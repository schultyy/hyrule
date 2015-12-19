#! /usr/bin/env node
'use strict';
var github = require('octonode');
var PouchDB = require('pouchdb');

function printHelp() {

}

function handleError(error) {
  console.log(error);
}

function createDatabaseName(identifier) {
  return identifier.split("/")[1];
}

function saveToDatabase(databaseName, issues) {
  console.log(issues);
  var db = new PouchDB(databaseName);
  issues.forEach(db.put);
}

var userArgs = process.argv.slice(2);
var repositoryName = userArgs[0];
if(!repositoryName) {
  console.log("Repository name is missing");
  printHelp();
  process.exit(1);
}
var client = github.client();
var ghrepo = client.repo(repositoryName);
ghrepo.issues(function(err, issues) {
  if(err) {
    handleError(err);
    return;
  }

  saveToDatabase(createDatabaseName(repositoryName), issues);
});
