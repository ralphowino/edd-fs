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
      console.log(response);
      return this.readFile(response.path).then((content)=> {
        response.content = content;
        return response;
      });
    });
  }

  readFile(path) {
    if (!fs.existsSync(path)) {
      return q.reject(new Error('File does not exist'));
    }
    return reader.read(path);
  }

  getRealPath(path) {

    if (fs.isAbsolute(path)) {
      return q.resolve({
        type: 'absolute',
        path: path
      });
    }
    let localPath = this.getLocalFolder();
    if (localPath && fs.exists(localPath + '/' + path)) {
      return q.resolve({
        type: 'local',
        path: localPath + '/' + path
      });
    }
    if (fs.exists(this.globalFolder + '/' + path)) {
      return q.resolve({
        type: 'local',
        path: this.globalFolder + '/' + path
      });
    }
    return q.reject(new Error('File not found'));
  }


  getLocalFolder(targetFile, startingPoint, levels) {
    if (startingPoint) {
      startingPoint = './';
    }

    if (levels) {
      levels = fs.absolute(startingPoint).split('/').length;

      //Checks if a windows machines
      if (levels == 1) {
        levels = fs.absolute(startingPoint).split('\\').length;
      }

      return levels;
    }

    if (fs.existsSync(startingPoint + '/' + targetFile)) {
      return (startingPoint + '/' + targetFile).replace('//', '/');
    }

    if ((levels - 1) != 0) {
      return r_transverseFileSystem(targetFile, startingPoint + '../', (levels - 1));
    }

    return false;
  }
}

module.exports = new Loader;



