var program = require('commander'),
  manager = require('../components/manager'),
  q = require('q'),
  fs = require('fs-plus');

var command = {};
command.init = init;
command.handle = handle;
module.exports = command;


function init() {
  program
    .command('init')
    .description('Initialize a new eddie instance')
    .option('-f, --force', 'Force re-initialization if already existing')
    .action(command.handle);
}

function handle() {
  "use strict";
  var overwrite = program.force;

  if (fs.existsSync(manager.eddiePath)) {
    overwrite = io.confirm('eddie is already initialized, do you want to re-initialize it');
    q.resolve(overwrite).then(function (force) {
      if (force) {
        manager.init(force);
      }
    });
  } else {
    manager.init();
  }
}



