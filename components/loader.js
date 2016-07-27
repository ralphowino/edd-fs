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
        let deferred = q.defer();
        this.getRealPath(path).then((response)=> {
            this.readFile(response.path).then((content)=> {
                response.content = content;
                return deferred.resolve(response);
            }, (err) => {
                return deferred.reject(err);
            });
        }, (err) => {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    readFile(path) {
        let deferred = q.defer();

        fs.exists(path, () => {
            reader.read(path).then((content) => {
                deferred.resolve(content)
            }, (err) => {
                deferred.reject(err);
            });
        }, () => {
            return deferred.reject(new Error('File does not exist'));
        });

        return deferred.promise;
    }

    getRealPath(path) {
        let deferred = q.defer();
        // Check if path is absolute and return the absolute path
        if (fs.isAbsolute(path)) {
            return deferred.resolve({
                type: 'absolute',
                path: path
            });
        }

        // Check and if exists return the local path
        let localPath = this.getLocalFolder();

        fs.exists(localPath + '/' + path, () => {
            return deferred.resolve({
                type: 'local',
                path: fs.absolute(localPath) + '/' + path
            })
        }, (err) => {
            fs.exists(this.globalFolder + '/' + path, () => {
                return deferred.resolve({
                    type: 'local',
                    path: this.globalFolder + '/' + path
                });
            }, (err) => {
                return deferred.reject(new Error('File not found'));
            })
        });

        return deferred.promise;
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



