'use strict';

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
    var fileContent;

    //Check if path is absolute
    if(fs.isAbsolute(path)) {
        fileContent = readFile(path);
        if(fileContent) {
            return buildResponse('absolute', path, fileContent);
        }
        return null;
    }

    // Transverse file system for the .eddie folder
    var eddieFolder = r_transverseFileSystem('.eddie');

    if (eddieFolder) {
        fileContent = readFile(eddieFolder + '/' + path);
        console.log(fileContent);
        if(fileContent) {
            return buildResponse('local', eddieFolder + '/' + path, fileContent);
        }
    }

    fileContent = readFile(fs.getHomeDirectory() + '/.eddie/' + path);
    if(fileContent) {
        return buildResponse('global', fs.getHomeDirectory() + '/.eddie/' + path, fileContent);
    }

    return null;
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
    console.log(fs.existsSync(path));
    if (fs.existsSync(path)) {
        return reader.read(path);
    }

    return false;
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



