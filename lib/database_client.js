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

DBClient.prototype.fetchDocuments = function() {
  return this.db.allDocs({
    include_docs: true
  });
}

DBClient.prototype.removeAll = function() {
  var self = this;
  return this.db.allDocs().then(function (result) {
    return Promise.all(result.rows.map(function (row) {
      return self.db.remove(row.id, row.value.rev);
    }));
  });
};

DBClient.prototype.insertDesignDocument = function() {
  var ddoc = {
    _id: '_design/issues',
    views: {
      by_number: {
        map: function (doc) { emit(doc.number); }.toString()
      }
    }
  };
  return this.db.put(ddoc)
  .catch(function (err) {
    console.log("ERR", err);
  });
};

DBClient.prototype.byKey = function(view, key) {
  return this.db.query(view, {
    key: key,
    include_docs: true
  });
};

module.exports = DBClient;
