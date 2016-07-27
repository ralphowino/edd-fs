'use strict';

var q = require('q');
var writer = require('./../writer');
var transverser = require('./../transversal/transverse');

/**
 * Checks for the file and reads the content of the file if the file is present
 *
 * @param path
 * @param content
 * @returns {*}
 */
function writeToLocalFile(path, content)
{
    var deferred = q.defer();

    writer.write(transverser.r_transverseFileSystem('.eddie') + '/' + path, content).then(function () {
        return deferred.fulfill();
    }, function (err) {
        return deferred.reject(err);
    });

    return deferred.promise;
}

exports.writeToLocalFile = writeToLocalFile;

