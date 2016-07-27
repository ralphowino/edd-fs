'use strict';

var _ = require('lodash');
var fs = require('fs-plus');

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
 * Checks if the local .eddie folder exists
 *
 * @returns {boolean}
 */
function localDirectoryExists()
{
    return Boolean(r_transverseFileSystem('.eddie'));
}


exports.findFile = findFile;
exports.localDirectoryExists = localDirectoryExists;
exports.r_transverseFileSystem = r_transverseFileSystem;