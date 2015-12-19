'use strict';
var PouchDB = require('pouchdb');
var uuid = require('uuidv4');

exports.createDatabaseName = function (identifier) {
  return identifier.split("/")[1];
}

exports.saveToDatabase = function(databaseName, issues) {
  var db = new PouchDB(databaseName);
  return Promise.all(issues.map(function(issue) {
    var doc = Object.assign({'_id': uuid() }, issue);
    return db.put(doc);
  }))
  .catch(function(err) {
    console.log("ERR", err);
  });
}

exports.fetchDocuments = function (databaseName) {
  var db = new PouchDB(databaseName);
  return db.allDocs({
    include_docs: true
  });
}

