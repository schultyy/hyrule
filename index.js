#! /usr/bin/env node

console.log('taskboard');
var userArgs = process.argv.slice(2);
var projectName = userArgs[0];
console.log('projectname', projectName);
