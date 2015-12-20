var blessed = require('blessed');
var db = require('./database_client');

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
  this.list = this.renderList();
}

MainWindow.prototype.initialize = function() {
  var self = this;
  db.fetchDocuments(this.dbName).then(function(resultSet) {
    if (resultSet.total_rows > 0) {
      return Promise.resolve(resultSet);
    } else {
      return initialFetch(repositoryName);
    }
  })
  .then(function(resultSet) {
    return Promise.resolve(resultSet.rows);
  })
  .then(function(resultSet) {
    self.list.setItems(resultSet.map(function(d) {
      return d.doc.title.toString();
    }));
  })
  .catch(function(err) {
    console.log("ERR", err);
  });
};

MainWindow.prototype.renderList = function() {
  return blessed.List({
    width: '100%',
    height: '100%',
    top: 'center',
    left: 'center',
    align: 'center',
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
