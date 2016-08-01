'use strict';

var _ = require('lodash'),
  manager = {},
  writer = require('./writer'),
  io = require('../../edd-io'),
  reader = require('./reader');


manager.basePath = process.cwd() + '/';
manager.eddiePath = manager.basePath.concat('.edd/');
manager.eddieFile = manager.eddiePath.concat('ed-config.js');

manager.init = function () {
  "use strict";
  io.info('initializing');
  var config = {version: '0.0.1'};
  writer
    .write(manager.eddieFile, JSON.stringify(config))
    .then(function () {
        io.success('eddie successfully initialized at' + manager.eddieFile);
        writer.mkdir(manager.eddiePath.concat('/libraries'));
        writer.mkdir(manager.eddiePath.concat('/templates'));
      },
      function (err) {
        io.error(err);
      });
};


exports.manager = manager;
