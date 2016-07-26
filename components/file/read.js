'use strict';

var fs = require('fs-plus');
var reader = require('./../reader');
var transverser = require('./../transversal/transverse');

/**
 * Checks for the file and reads the content of the file if the file is present
 *
 * @param path
 * @returns {*}
 */
function readFile(path) {
    if (fs.existsSync(path)) {
        return reader.read(path);
    }

    return false;
}

/**
 * Reads a file from the local .eddie folder
 *
 * @param path
 * @returns {*}
 */
function readLocalFile(path)
{
    var fileContent = readFile(transverser.r_transverseFileSystem('.eddie') + '/' + path);

    return fileContent ? fileContent : null;
}

/**
 * Reads a file from the global .eddie folder
 *
 * @param path
 * @returns {*}
 */
function readGlobalFile(path)
{
    var fileContent = readFile(fs.getHomeDirectory() + '/.eddie/' + path);

    return fileContent ? fileContent : null;
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

exports.readFile = readFile;
exports.buildResponse = buildResponse;
exports.readLocalFile = readLocalFile;
exports.readGlobalFile = readGlobalFile;
