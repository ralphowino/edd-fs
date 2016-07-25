var _ = require('lodash'),
  initCmd = require('./commands/init'),
  writer = require('./components/writer'),
  manager = require('./components/manager'),
  reader = require('./components/reader');

function init(){
  "use strict";
  initCmd.init();
}

exports = module.exports = _.merge(writer, reader, manager, {init: init});