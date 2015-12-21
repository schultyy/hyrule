'use strict';
var PouchDB = require('pouchdb');
var uuid = require('uuidv4');

function DBClient(databaseName) {
  this.dbName = createDatabaseName(databaseName);
  this.db = new PouchDB(this.dbName);
}

function createDatabaseName(identifier) {
  return identifier.split("/")[1];
}

DBClient.prototype.saveToDatabase = function(issues) {
  return Promise.all(issues.map((issue) => {
    var doc = Object.assign({'_id': uuid() }, issue);
    return this.db.put(doc);
  }));
}

DBClient.prototype.fetchDocuments = function () {
  return this.db.allDocs({
    include_docs: true
  });
}

module.exports = DBClient;
