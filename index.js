#! /usr/bin/env node
'use strict';
var github = require('octonode');
var MainWindow = require('./lib/ui');

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
  let ui = new MainWindow(repositoryName);
  ui.initialize();
  ui.render();
}

main();
