var _ = require('lodash'),
  initCmd = require('./commands/init'),
  readCmd = require('./commands/read'),
  writeCmd = require('./commands/write'),
  writer = require('./components/writer'),
  loader = require('./components/loader'),
  manager = require('./components/manager'),
  reader = require('./components/reader');

function init() {
  "use strict";
  initCmd.init();
  readCmd.init();
  writeCmd.init();
}

module.exports = _.assign(writer, reader, manager, {init: init});
module.exports.loader = loader;


