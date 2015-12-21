'use strict';
var blessed = require('blessed');
var Facade = require('./facade');

var screen = blessed.screen({
  smartCSR: true
});

function MainWindow(repositoryName) {
  this.facade = new Facade(repositoryName);
  this.list = this.createList();
  this.selected = null;
  this.escapeKeys = ['escape', 'q', 'C-c'];
  this.modal = null;

  this.list.on('select', (selected) => {
    if(!selected) {
      return;
    }
    this.selected = selected.index;
    this.selectHandler();
  });
  this.addCloseHandler();
}

MainWindow.prototype.selectHandler = function() {
  var selected = this.issues[this.selected - 1];
  if(this.modal) {
    this.modal.update(selected);
  } else {
    this.modal = new ModalWindow(selected);
    this.modal.render();
  }
};

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
  this.facade.loadIssues()
  .then(function(resultSet) {
    self.list.setItems(resultSet.map(function(d) {
      let title = d.title.toString();
      let id = d.number.toString();
      return `${id}-${title}`;
    }));
    screen.render();
    self.issues = resultSet;
  })
  .catch(function(err) {
    console.log(err);
    console.log(err.stack);
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

function ModalWindow(issue) {
  this.box = null;
  this.issue = issue;
}

ModalWindow.prototype.render = function() {
  if(!this.box) {
    this.box = blessed.box({
      top: 'center',
      left: 'center',
      width: '80%',
      height: '80%',
      tags: true,
      scrollable: true,
      mouse: true,
      keys: true,
      vi: true,
      scrollbar: {
        bg: 'black'
      },
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
    this.updateBoxContent();
    screen.append(this.box);
  }
  screen.render();
  this.box.focus();
};

ModalWindow.prototype.updateBoxContent = function() {
  if(!this.box){
    return;
  }

  var creator = this.issue.user.login;

  var assignee = '';
  if(this.issue.assignee) {
    assignee = this.issue.assignee.login;
  }
  var body = this.issue.body;
  var labels = '';

  labels = this.issue.labels.map(function(label) {
    return label.name;
  }).join(", ");

  var content = `Created by: ${creator}\nAssignee: ${assignee}\nLabels: ${labels}\n\n${body}`;
  this.box.setContent(content);
};

ModalWindow.prototype.update = function(newIssue) {
  this.issue = newIssue;
  this.updateBoxContent();
  screen.render();
  this.box.focus();
};

ModalWindow.prototype.close = function() {
  screen.remove(this.box);
  this.box.destroy();
  this.box = null;
};

module.exports = MainWindow;
