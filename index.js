#! /usr/bin/env node
'use strict';
var MainWindow = require('./lib/ui');

function printHelp() {
  console.log("Usage: hyrule <reponame>");
  console.log("Where reponame follows the github handle/repository notation");
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
  let ui = new MainWindow(repositoryName);
  ui.render();
  ui.initialize();
}

main();
