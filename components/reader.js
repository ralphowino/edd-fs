var q = require('q'),
  fs = require('fs-plus');

module.exports.read = function (path, content, options) {
  q.resolve(fs.writeSync(path, content));
};


exports = module.exports;