#! /usr/bin/env node
'use strict';
var github = require('octonode');

function printHelp() {

}

function handleError(error) {
  console.log(error);
}

function saveToDatabase(issues) {
  console.log(issues);
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

  saveToDatabase(issues);
});
