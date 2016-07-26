var _ = require('lodash'),
  initCmd = require('./commands/init'),
  readCmd = require('./commands/read'),
  writeCmd = require('./commands/write'),
  writer = require('./components/writer'),
  manager = require('./components/manager'),
  reader = require('./components/reader');

function init() {
  "use strict";
  initCmd.init();
  readCmd.init();
  writeCmd.init();
}

exports = module.exports = _.merge(writer, reader, manager, {init: init});
