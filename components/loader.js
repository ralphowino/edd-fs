'use strict';

var q = require('q');
var _ = require('lodash');
var fs = require('fs-plus');
var reader = require('./reader');

class Loader {
  loadFile(path) {
    return this.getRealPath(path).then(function (response) {
      return this.readFile(response.path).then(function (content) {
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

  getRealPath() {
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
    let globalPath = this.getGlobalFolder();
    if (globalPath && fs.exists(globalPath + '/' + path)) {
      return q.resolve({
        type: 'local',
        path: globalPath + '/' + path
      });
    }
    return q.reject(new Error('File not found'));
  }

  getGlobalFolder() {
    return fs.getHomeDirectory() + '/.ed/';
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

/**
 * Loads the file in the specified path from the closest .ed folder
 *
 * @param path
 * @returns {{source: *, path: *, content: *}} || null
 */
exports.loadFile = function (path) {
  var deferred = q.defer();
  // Check if path is absolute and fetches the data if it is.


  return deferred.promise;
};

module.exports = new Loader;



