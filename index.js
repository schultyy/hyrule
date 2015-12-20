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
  return new Promise(function(fullfill, reject) {
    var client = github.client();
    var ghrepo = client.repo(repoId);
    ghrepo.issues(function(err, issues) {
      if(err) {
        reject(err);
      } else {
        fullfill(issues);
      }
    });
  });
}

function prepareArgs() {
  var userArgs = process.argv.slice(2);
  return userArgs[0];
}

function main() {
  let repositoryName = prepareArgs();
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
      return fetchFromGitHub(repositoryName).then(function(issues) {
        return db.saveToDatabase(dbName, issues);
      });
    }
  })
  .catch(function(err) {
    console.log("ERR", err);
  });
}

main();
