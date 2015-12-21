'use strict';
var blessed = require('blessed');
var db = require('./database_client');
var github = require('octonode');

var screen = blessed.screen({
  smartCSR: true
});

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

function initialFetch(repositoryName) {
  var dbName = db.createDatabaseName(repositoryName);
  return fetchFromGitHub(repositoryName).then(function(issues) {
    return db.saveToDatabase(dbName, issues);
  })
  .then(function() {
    return db.fetchDocuments(dbName);
  });
}

function MainWindow(repositoryName) {
  this.repositoryName = repositoryName;
  this.dbName = db.createDatabaseName(this.repositoryName);
  this.list = this.createList();
}

MainWindow.prototype.initialize = function() {
  var self = this;
  db.fetchDocuments(this.dbName).then((resultSet) => {
    if (resultSet.total_rows > 0) {
      return Promise.resolve(resultSet);
    } else {
      return initialFetch(this.repositoryName);
    }
  })
  .then(function(resultSet) {
    return Promise.resolve(resultSet.rows);
  })
  .then(function(resultSet) {
    self.list.setItems(resultSet.map(function(d) {
      let title = d.doc.title.toString();
      let id = d.doc.number.toString();
      return `${id}-${title}`;
    }));
    screen.render();
  })
  .catch(function(err) {
    console.log("ERR", err);
  });
};

MainWindow.prototype.createList = function() {
  return blessed.List({
    width: '100%',
    height: '100%',
    top: 'center',
    left: 'center',
    align: 'left',
    fg: 'blue',
    border: {
      type: 'line'
    },
    selectedBg: 'green',
    mouse: true,
    keys: true,
    vi: true
  });
};

MainWindow.prototype.render = function() {
  screen.title = 'taskboard';
  screen.append(this.list);
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });
  this.list.focus();
  screen.render();
};

module.exports = MainWindow;
