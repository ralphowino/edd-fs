var program = require('commander'),
  io = require('../../io'),
  manager = require('../components/manager'),
  q = require('q'),
  fs = require('fs-plus'),
  reader = require('../components/reader');

var command = {};
command.init = init;
command.handle = handle;
module.exports = command;


function init() {
  program
    .command('read')
    .description('Reads a json or yaml file and dumps its contents on the console')
    .arguments('<path>', "The path of the file to read")
    .action(command.handle)
    .parse(process.argv);
}

function handle(path) {
  "use strict";

  if (path == undefined) {
    throw new Error('Required argument `path` not provided');
  }

  if (!fs.isFileSync(path)) {
    console.error('ERROR: Argument `path` is not a valid file path');
    process.exit(1);
  }

  reader.read(path)
    .then(function (data) {
      console.log(data);
    })
    .catch(function (err) {
      console.log(err ? err : '');
    });
}



