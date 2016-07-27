'use strict';

var q = require('q');
var _ = require('lodash');
var fs = require('fs-plus');
var reader = require('./reader');

class Loader {
  constructor() {
    this.globalFolder = fs.getHomeDirectory() + '/.ed/';
  }

  loadFile(path) {
    return this.getRealPath(path).then((response)=> {
      return this.readFile(response.path).then((content)=> {
        response.content = content;
        return response
      });
    });
  }

  readFile(path) {
    if (fs.existsSync(path)) {
      return reader.read(path);
    }
    return q.reject(new Error('File does not exist'));
  }

  getRealPath(path) {
    // Check if path is absolute and return the absolute path
    if (fs.isAbsolute(path)) {
      return q.resolve({
        type: 'absolute',
        path: path
      });
    }

    // Check and if exists return the local path
    let localPath = this.getLocalFolder();
    if (fs.existsSync(localPath + '/' + path)){
      return q.resolve({
        type: 'local',
        path: fs.absolute(localPath) + '/' + path
      })
    }

    if (fs.existsSync(this.globalFolder + '/' + path)){
      return q.resolve({
        type: 'global',
        path: this.globalFolder + '/' + path
      });
    }
    return q.reject(new Error('File not found'));

  }


  getLocalFolder(targetFile, startingPoint, levels) {

    if (!targetFile) {
      targetFile = '.ed'
    }

    if (!startingPoint) {
      startingPoint = './';
    }

    if (!levels) {
      levels = fs.absolute(startingPoint).split('/').length;

      //Checks if a windows machines
      if (levels == 1) {
        levels = fs.absolute(startingPoint).split('\\').length;
      }
    }

    if (fs.existsSync((startingPoint + '/' + targetFile))) {
      return (startingPoint + '/' + targetFile).replace('//', '/');
    }

    if ((levels - 1) != 0) {
      return this.getLocalFolder(targetFile, startingPoint + '../', (levels - 1));
    }

    return false;
  }
}

module.exports = new Loader;



