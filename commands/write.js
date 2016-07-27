'use strict';

var program = require('commander'),
  q = require('q'),
  fs = require('fs-plus'),
  reader = require('../components/reader'),
  writer = require('../components/writer');

var command = {};
command.init = init;
command.handle = handle;
module.exports = command;


function init() {
  program
    .command('write')
    .description('Writes data to a specified file')
    .arguments('<path> <data>', "The path of the file to write", "Data to write")
    .action(command.handle)
    .parse(process.argv);
}

function handle(path, content) {
  "use strict";

  if (path == undefined) {
    throw new Error('Required argument `path` not provided');
  }

  if (content == undefined) {
    throw new Error('Required argument `data` not provided');
  }
  writer.write(path, content)
    .then(function () {
      console.log('Files written successfully');
    })
    .catch(function (err) {
      console.log(err ? err : '');
    });
}



