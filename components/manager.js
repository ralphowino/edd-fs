'use strict';

var _ = require('lodash'),
  writer = require('./writer'),
  q = require('q'),
  io = require('../../edd-io'),
  reader = require('./reader');

class Manager {
  constructor() {
    this.basePath = process.cwd() + '/';
    this.eddiePath = this.basePath.concat('.edd/');
    this.eddieFile = this.eddiePath.concat('edd-config.json');
  }

  init() {
    "use strict";
    io.output.info('initializing');
    var config = {version: '0.0.1'};


    return writer
      .write(this.eddieFile, JSON.stringify(config))
      .then((file)=> {
          let process = [];
          io.output.success('edd successfully initialized at' + file);

          process.push(writer.mkdir(this.eddiePath.concat('libraries')).then(()=> {
            io.output.success('Created libraries folder')
          }, ()=> {
            console.log(arguments)
          }));
          process.push(writer.mkdir(this.eddiePath.concat('templates')));

          return q.all(process);
        },
        (err) => {
          io.output.error(err);
        });
  }
}

module.exports = new Manager;
