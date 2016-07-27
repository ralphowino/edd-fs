'use strict';

var q = require('q');
var _ = require('lodash');
var fs = require('fs-plus');
var loader = require('./loader');
var file = require('./Filesystem/index');

class Copier {
    /**
     * Checks if a local version of the file exists and returns the file's contents
     *
     * @param path
     * @returns {*}
     */
    checkLocalVersion(path) {
        let deferred = q.defer();

        file.readLocalFile(path).then((fileContent) => {
            return deferred.resolve(file.buildResponse('local', path, fileContent))
        }, (err) => {
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
    fetchGlobalVersion(path) {
        let deferred = q.defer();

        file.readGlobalFile(path).then((fileContent) => {
            return deferred.resolve(fileContent);
        }, (err) => {
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
    createLocalVersion(path, content) {
        let deferred = q.defer();

        file.writeToLocalFile(path, content).then(() => {
            return deferred.resolve(file.buildResponse('local', path, content));
        }, (err) => {
            return deferred.reject(err);
        });

        return deferred.promise;
    }

    /**
     * Loads the file in the specified path from the closest .edd folder
     *
     * @param path
     * @returns {Promise}
     */
    copyFile(path) {
        let deferred = q.defer();

        if(!file.localDirectoryExists()){
            return  deferred.reject(new Error('Local .edd folder does not exist.'));
        }

        this.checkLocalVersion(path).then((response) => {
            return deferred.resolve(response);
        }, (err) => {
            this.fetchGlobalVersion(path).then((content) => {
                this.createLocalVersion(path, content).then((response) => {
                    return deferred.resolve(response);
                },  (err) => {
                    return deferred.reject(err);
                })
            },  (err) => {
                return deferred.reject(err);
            });
        });

        return deferred.promise;
    }
}

module.exports = new Copier;