var blessed = require('blessed');

var screen = blessed.screen({
  smartCSR: true
});

function renderTable(documents) {
  var list = blessed.List({
    width: '50%',
    height: '50%',
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

  list.setItems(documents.map(function(d) {
    return d.title.toString();
  }));

  list.select(0);

  return list;
}

module.exports = {
  render: function(documents) {
    // Create a screen object.

    screen.title = 'taskboard';

    var list = renderTable(documents);

    screen.append(list);

    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });

    list.focus();

    // Render the screen.
    screen.render();
  }
};
