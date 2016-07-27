'use strict';

var q = require('q');
var _ = require('lodash');
var fs = require('fs-plus');
var reader = require('./reader');

/**
 * Loads the file in the specified path from the closest .eddie folder
 *
 * @param path
 * @returns {{source: *, path: *, content: *}} || null
 */
exports.loadFile = function (path) {
    var deferred = q.defer();

    // Check if path is absolute and fetches the data if it is.
    if(fs.isAbsolute(path)) {
        readFile(path).then(function (fileContent) {
            return deferred.resolve(buildResponse('absolute', path, fileContent));
        }, function (err) {
            return deferred.reject(err);
        });
    }

    // Check for the local .eddie folder and fetches the file if it exists.
    var eddieFolder = r_transverseFileSystem('.eddie');

    if (Boolean(eddieFolder)) {
        readFile(eddieFolder + '/' + path).then(function (fileContent) {
            return deferred.resolve(buildResponse('local', eddieFolder + '/' + path, fileContent));
        });
    } else {
        // Fetch the global file and returns the data for the global file.
        var globalFolder = fs.getHomeDirectory() + '/.eddie/';

        readFile(globalFolder + path).then(function (fileContent) {
            return deferred.resolve(buildResponse('global', globalFolder + path, fileContent));
        }, function (err) {
            return deferred.reject(err);
        });
    }

    return deferred.promise;
};

/**
 * Recursively searches up the file system for a file
 *
 * @param targetFile
 * @param startingPoint
 * @param levels
 * @returns {*} relativeFilePath
 */
var r_transverseFileSystem = function (targetFile, startingPoint, levels) {
    if (_.isUndefined(startingPoint)) {
        startingPoint = './';
    }

    if (_.isUndefined(levels)) {
        levels = fetchDirectoryLevels(startingPoint);
    }

    if (findFile(startingPoint, targetFile)) {
        return (startingPoint + '/' + targetFile).replace('//', '/');
    }

    if ((levels - 1) != 0) {
        return r_transverseFileSystem(targetFile, startingPoint + '../', (levels - 1));
    }

    return false;
};

/**
 * Checks if a file exists in a directory
 *
 * @param directory
 * @param targetFile
 * @returns {boolean} fileExists
 */
function findFile(directory, targetFile) {
    var files = fs.readdirSync(directory);
    for (var i in files) {
        if (files[i] == targetFile) {
            return true;
        }
    }

    return false;
}

/**
 * Checks for the file and reads the content of the file if the file is present
 *
 * @param path
 * @returns {*}
 */
function readFile(path) {
    var deferred = q.defer();

    fs.stat(path, function (err, stat) {
        if(err == null) {
            reader.read(path).then(function (response) {
                return deferred.resolve(response);
            }, function (err) {
                return deferred.reject(new Error(err));
            });
        } else if(err.code == 'ENOENT') {
            return deferred.reject(new Error('File does not exist'));
        } else {
            return deferred.reject(new Error(err));
        }
    });

    return deferred.promise;
}

/**
 * Fetches the levels the current directory is compared to the base directory
 *
 * @param {String} startingPoint
 * @returns {Number} directoryLevels
 */
function fetchDirectoryLevels(startingPoint) {
    var absolute = fs.absolute(startingPoint);
    var levels = absolute.split('/').length;

    //Checks if a windows machines
    if (levels == 1) {
        levels = absolute.split('\\').length;
    }

    return levels;
}

/**
 * Build up the response object
 *
 * @param source
 * @param path
 * @param content
 * @returns {{source: *, path: *, content: *}}
 */
function buildResponse(source, path, content) {
    return {
        'source': source,
        'path': path,
        'content': content
    }
}



