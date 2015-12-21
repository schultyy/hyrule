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
  this.selected = null;
  this.escapeKeys = ['escape', 'q', 'C-c'];
  this.modal = null;

  this.list.on('select', (selected) => {
    this.selected = selected;
  });
  this.list.key('return',() => {
    if(this.modal) {
      return;
    }
    this.modal = new ModalWindow();
    this.modal.render();
  });
  this.addCloseHandler();
}

MainWindow.prototype.addCloseHandler = function() {
  screen.key(this.escapeKeys, () => {
    if(this.modal) {
      this.modal.close();
      screen.render();
      this.modal = null;
    } else {
      return process.exit(0);
    }
  });
};

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
  this.list.focus();
  screen.render();
};

function ModalWindow() {
  this.box = null;
}

ModalWindow.prototype.render = function() {
  if(!this.box) {
    this.box = blessed.box({
      top: 'center',
      left: 'center',
      width: '50%',
      height: '50%',
      content: 'Hello {bold}world{/bold}!',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'magenta',
        border: {
          fg: '#f0f0f0'
        },
        hover: {
          bg: 'green'
        }
      }
    });
    screen.append(this.box);
  }
  screen.render();
};

ModalWindow.prototype.close = function() {
  screen.remove(this.box);
  this.box = null;
};

module.exports = MainWindow;
