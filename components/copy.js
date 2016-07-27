'use strict';

var q = require('q');
var _ = require('lodash');
var fs = require('fs-plus');
var loader = require('./loader');
var reader = require('./file/read');
var writer = require('./file/write');
var transverser = require('./transversal/transverse');

/**
 * Checks if a local version of the file exists and returns the file's contents
 *
 * @param path
 * @returns {*}
 */
function checkLocalVersion(path) {
    var deferred = q.defer();

    reader.readLocalFile(path).then(function (fileContent) {
        return deferred.resolve(reader.buildResponse('local', path, fileContent))
    }, function (err) {
        return deferred.reject(err);
    });

    return deferred.promise;
}

/**
 * Fetch a global version of the file being seeked
 *
 * @param path
 * @returns {*}
 */
function fetchGlobalVersion(path) {
    var deferred = q.defer();

    reader.readGlobalFile(path).then(function (fileContent) {
        return deferred.resolve(fileContent);
    }, function (err) {
        return deferred.reject(err);
    });

    return deferred.promise;
}

/**
 * Creates a local version of the file
 *
 * @param path
 * @param content
 * @returns {*}
 */
function createLocalVersion(path, content) {
    var deferred = q.defer();

    writer.writeToLocalFile(path, content).then(function () {
        return deferred.resolve(reader.buildResponse('local', path, content));
    }, function (err) {
        return deferred.reject(err);
    });

    return deferred.promise;
}

/**
 * Loads the file in the specified path from the closest .eddie folder
 *
 * @param path
 * @returns {Promise}
 */
exports.copyFile = function (path) {
    var deferred = q.defer();

    if(!transverser.localDirectoryExists()){
        return  deferred.reject(new Error('Local .eddie folder does not exist.'));
    }

    checkLocalVersion(path).then(function (response) {
        return deferred.resolve(response);
    }, function (err) {
        fetchGlobalVersion(path).then(function (content) {
            createLocalVersion(path, content).then(function (response) {
                return deferred.resolve(response);
            }, function (err) {
                return deferred.reject(err);
            })
        }, function (err) {
            return deferred.reject(err);
        })
    });

    return deferred.promise;
};