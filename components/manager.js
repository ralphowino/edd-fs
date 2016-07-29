'use strict';

var _ = require('lodash'),
  writer = require('./writer'),
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
    io.info('initializing');
    var config = {version: '0.0.1'};


    writer
      .write(this.eddieFile, JSON.stringify(config))
      .then((file)=> {
          io.success('edd successfully initialized at' + file);
          writer.mkdir(this.eddiePath.concat('libraries')).then(()=> {
            io.success('Created libraries folder')
          }, ()=> {
            console.log(arguments)
          });
          writer.mkdir(this.eddiePath.concat('templates'));
        },
        (err) => {
          io.error(err);
        });
  }
}

module.exports = new Manager;
