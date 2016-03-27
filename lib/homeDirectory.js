const path = require('path'),
      fs = require('fs'),
      os = require('os');

exports.prepare = function() {
  var homedir = os.homedir();
  var appDir = path.join(homedir, '.hyrule');
  if(!exists(appDir)) {
    fs.mkdirSync(appDir);
  }
  return appDir;
};

function exists(path) {
  try {
    fs.statSync(path);
    return true;
  } catch(err) {
    return false;
  }
}
