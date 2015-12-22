'use strict';
var blessed = require('blessed');
var Facade = require('./facade');

var screen = blessed.screen({
  smartCSR: true
});

function MainWindow(repositoryName) {
  this.facade = new Facade(repositoryName);
  this.list = this.createList();
  this.menubar = this.createMenubar();
  this.selected = null;
  this.escapeKeys = ['escape', 'q', 'C-c'];
  this.modal = null;
  this.progressbar = null;
  this.issues = null;

  this.list.on('select', (selected) => {
    if(!selected) {
      return;
    }
    this.selected = this.issues[selected.getText()];
    this.selectHandler();
  });
  this.addCloseHandler();
}

MainWindow.prototype.showProgressbar = function() {
  this.progressbar = blessed.loading();
  this.progressbar.load('Loading...');
  screen.append(this.progressbar);
  screen.render();
};

MainWindow.prototype.hideProgressbar = function() {
  this.progressbar.stop();
  screen.remove(this.progressbar);
  screen.render();
};

MainWindow.prototype.selectHandler = function() {
  if(this.modal) {
    this.modal.update(this.selected);
  } else {
    this.modal = new DetailWindow(this.selected);
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
  this.showProgressbar();
  return this.facade.loadIssues()
  .then(function(resultSet) {
    var sorted = resultSet.sort(function(a,b) {
      if(a.created_at == b.created_at) {
        return 0;
      } else if (a.created_at < b.created_at) {
        return 1;
      } else {
        return -1;
      }
    });
    var createTitle = function(d) {
      let title = d.title.toString();
      let id = d.number.toString();
      return `${id}-${title}`;
    };
    self.list.setItems(resultSet.map(createTitle));
    screen.render();
    self.issues = { };
    resultSet.forEach(function(d) {
      self.issues[createTitle(d)] = d;
    });
    self.hideProgressbar();
  })
  .catch(function(err) {
    console.log(err);
    console.log(err.stack);
  });
};

MainWindow.prototype.createMenubar = function() {
  var self = this;
  return blessed.listbar({
    height: 3,
    border: 'line',
    style: {
      bg: 'green',
      item: {
        bg: 'red',
        hover: {
          bg: 'blue'
        },
        selected: {
          bg: 'blue'
        }
      }
    },
    commands: {
      'reload': {
        keys: ['r'],
        callback: function(){
          if(self.modal) {
            self.modal.close();
            screen.render();
            self.modal = null;
          }
          self.facade.hasNetworkConnectivity()
          .then(function(hasNetwork) {
            if(hasNetwork) {
              return self.facade.removeAll()
              .then(() => {
                return self.initialize();
              });
            }
          })
          .catch(function(err) {
            console.log(err);
            console.log(err.stack);
          });
        }
      }
    }
  });
};

MainWindow.prototype.createList = function() {
  return blessed.List({
    top: 3,
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
  screen.title = 'hyrule';
  screen.append(this.menubar);
  screen.append(this.list);
  this.list.focus();
  screen.render();
};

function DetailWindow(issue) {
  this.box = null;
  this.issue = issue;
}

DetailWindow.prototype.render = function() {
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

DetailWindow.prototype.updateBoxContent = function() {
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

  var content = `{bold}${this.issue.title}{/bold}\n\nCreated by: ${creator}\nAssignee: ${assignee}\nLabels: ${labels}\n\n${body}`;
  this.box.setContent(content);
};

DetailWindow.prototype.update = function(newIssue) {
  this.issue = newIssue;
  this.updateBoxContent();
  screen.render();
  this.box.focus();
};

DetailWindow.prototype.close = function() {
  screen.remove(this.box);
  this.box.destroy();
  this.box = null;
};

module.exports = MainWindow;
