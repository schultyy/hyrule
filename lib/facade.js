var DBClient = require('./databaseClient');
var github = require('octonode');
var dns = require('dns');
var home = require('./homeDirectory');
var path = require('path');

function createDatabaseName(identifier) {
  var appDir = home.prepare();
  var repositoryName = identifier.split("/")[1];
  return path.join(appDir, repositoryName);
}

function Facade(repositoryName) {
  this.repositoryName = repositoryName;
  this.db = new DBClient(createDatabaseName(repositoryName));
}

Facade.prototype.hasNetworkConnectivity = function() {
  return new Promise(function(fullfill, reject) {
    require('dns').lookup('github.com',function(err) {
      if (err && err.code == "ENOTFOUND") {
        fullfill(false);
      } else if(err && err.code != "ENOTFOUND") {
        reject(err);
      } else {
        fullfill(true);
      }
    });
  });

};

Facade.prototype.fetchFromGitHub = function() {
  var self = this;
  return new Promise((fullfill, reject) => {
    var client = github.client();
    var ghrepo = client.repo(this.repositoryName);
    ghrepo.issues(1, 300, function(err, issues) {
      if(err) {
        reject({
          message: `Repository ${self.repositoryName} not found`,
          error: err
        });
      } else {
        fullfill(issues);
      }
    });
  });
}

Facade.prototype.initialFetch = function() {
  return this.fetchFromGitHub()
  .then((issues) => {
    return this.db.saveToDatabase(issues);
  })
  .then(() => {
    return this.db.fetchDocuments();
  });
}

Facade.prototype.loadIssues = function(opts) {
  var withPullRequests = (opts && opts.withPullRequests) || false;
  return this.db.fetchDocuments().then((resultSet) => {
    if (resultSet.total_rows > 0) {
      return Promise.resolve(resultSet);
    } else {
      return this.initialFetch();
    }
  })
  .then(function(resultSet) {
    var docs = resultSet.rows.map((row) => {
      return row.doc;
    });

    if(withPullRequests) {
      return Promise.resolve(docs);
    }

    return Promise.resolve(docs.filter((doc) => {
      return !doc.pull_request
    }));
  });
}

Facade.prototype.removeAll = function() {
  return this.db.removeAll();
};

module.exports = Facade;
