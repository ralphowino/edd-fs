'use strict';

var q = require('q');
var fs = require('fs-plus');
var reader = require('./../reader');
var writer = require('./../writer');

class FileSystem {

    constructor() {
        this.globalFolder = fs.getHomeDirectory() + '/.edd/';
    }

    /**
     * Checks for the file and reads the content of the file if the file is present
     *
     * @param path
     * @param content
     * @returns {*}
     */
    writeToLocalFile(path, content) {
        var deferred = q.defer();

        writer.write(this.getLocalFolder() + '/' + path, content).then( () => {
            return deferred.resolve('Successfully wrote to the file');
        },  (err) => {
            return deferred.reject(err);
        });

        return deferred.promise;
    }

    /**
     * Checks for the file and reads the content of the file if the file is present
     *
     * @param path
     * @returns {*}
     */
    readFile(path) {
        var deferred = q.defer();

        fs.exists(path, () => {
            reader.read(path).then( (response) => {
                return deferred.resolve(response);
            },  (err) => {
                return deferred.reject(err);
            });
        }, () => {
            return deferred.reject(new Error('File does not exist'));
        });

        return deferred.promise;
    }


    /**
     * Recursively searches up the file system for a file
     *
     * @param targetFile
     * @param startingPoint
     * @param levels
     * @returns {*} relativeFilePath
     */
    getLocalFolder(targetFile, startingPoint, levels) {

        if(!targetFile) {
            targetFile = '.edd';
        }

        if(!startingPoint) {
            startingPoint = './';
        }

        if(!levels) {
            levels = FileSystem.fetchDirectoryLevels(startingPoint);
        }

        if (fs.existsSync((startingPoint + '/' + targetFile))) {
            return (startingPoint + '/' + targetFile).replace('//', '/');
        }

        if ((levels - 1) != 0) {
            return this.getLocalFolder(targetFile, startingPoint + '../', (levels - 1));
        }

        return false;
    }

    /**
     * Fetches the levels the current directory is compared to the base directory
     *
     * @param {String} startingPoint
     * @returns {Number} directoryLevels
     */
    static fetchDirectoryLevels(startingPoint) {
        let absolute = fs.absolute(startingPoint);
        let levels = absolute.split('/').length;

        //Checks if a windows machines
        if (levels == 1) {
            levels = absolute.split('\\').length;
        }

        return levels;
    }

    /**
     * Checks if the local .edd folder exists
     *
     * @returns {boolean}
     */
    localDirectoryExists() {
        return Boolean(this.getLocalFolder());
    }


    /**
     * Reads a file from the local .edd folder
     *
     * @param path
     * @returns {*}
     */
    readLocalFile(path) {
        return this.readFile(this.getLocalFolder() + '/' + path);
    }

    /**
     * Reads a file from the global .edd folder
     *
     * @param path
     * @returns {*}
     */
    readGlobalFile(path) {
        return this.readFile(this.globalFolder + path);
    }

    /**
     * Build up the response object
     *
     * @param source
     * @param path
     * @param content
     * @returns {{source: *, path: *, content: *}}
     */
    buildResponse(source, path, content) {
        return {
            'source': source,
            'path': path,
            'content': content
        }
    }
}

module.exports = new FileSystem;