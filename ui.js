var blessed = require('blessed');

var screen = blessed.screen({
  smartCSR: true
});

function renderTable(documents) {
  var list = blessed.List({
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
  documents.forEach(function(d) {
    list.pushItem(d.title.toString());
  });
  return list;
}

module.exports = {
  render: function(documents) {
    // Create a screen object.

    screen.title = 'taskboard';

    // Append our box to the screen.
    screen.append(renderTable(documents));

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });

    // Focus our element.
    // box.focus();

    // Render the screen.
    screen.render();
  }
};
