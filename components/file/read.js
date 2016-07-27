'use strict';

var q = require('q');
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
 * Reads a file from the local .eddie folder
 *
 * @param path
 * @returns {*}
 */
function readLocalFile(path)
{
    return readFile(transverser.r_transverseFileSystem('.eddie') + '/' + path);
}

/**
 * Reads a file from the global .eddie folder
 *
 * @param path
 * @returns {*}
 */
function readGlobalFile(path)
{
    return readFile(fs.getHomeDirectory() + '/.eddie/' + path);
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
