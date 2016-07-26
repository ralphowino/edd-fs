'use strict';

var q = require('q');
var _ = require('lodash');
var fs = require('fs-plus');
var loader = require('./loader');
var reader = require('./file/read');
var writer = require('./file/write');
var transverser = require('./transversal/transverse');

/**
 * Loads the file in the specified path from the closest .eddie folder
 *
 * @param path
 * @returns {{source: *, path: *, content: *}} || null
 */
exports.copyFile = function (path) {
    var deferred = q.defer();

    if(!transverser.localDirectoryExists()){
        return  deferred.reject();
    }

    var localFileContent = reader.readLocalFile(path);
    if(!_.isNull(localFileContent)) {
        return deferred.fulfill(localFileContent);
    }

    var globalFileContent = reader.readGlobalFile(path);

    writer.writeToLocalFile(path, globalFileContent).then(function () {
        return deferred.fulfill(reader.buildResponse('local', path, globalFileContent));
    }, function (err) {
        return deferred.reject(err);
    });

    return deferred.promise;
};