var q = require('q');
var _ = require('lodash');
var fs = require('fs-plus');

import {Reader} from './reader';

class ClassLoader {
    constructor() {
        this.types = ['json', 'yaml', 'yml'];
        this.globalFolder = fs.getHomeDirectory() + '/.edd/';
    }

    /**
     * Load a file given the file's path
     *
     * @param path
     * @returns {*}
     */
    loadFile(path) {
        return this.getRealPath(path).then((response)=> {
            return this.readFile(response.path).then((content)=> {
                response.content = content;
                return response
            });
        });
    }

    /**
     * Load a file given the file's path
     *
     * @param path
     * @returns {*}
     */
    loadFileSync(path) {
        return this.getRealPath(path).then((response)=> {
            return this.readFile(response.path).then((content)=> {
                response.content = content;
                return response
            });
        });
    }

    readFile(path) {
        if (fs.existsSync(path)) {
            return Reader.read(path);
        }
        return q.reject(new Error('File does not exist'));
    }

    /**
     * Get the real path to the file specified
     *
     * @param path
     * @returns {*}
     */
    getRealPath(path) {
        // Check if path is absolute and return the absolute path
        if (fs.isAbsolute(path)) {
            return q.resolve({
                type: 'absolute',
                path: path
            });
        }

        // Check and if exists return the local path
        let localFolder = this.getLocalFolder();

        if (localFolder) {
            let localFilePath = this.fileExists(localFolder + '/' + path, this.types);

            if (localFilePath) {
                return q.resolve({
                    type: 'local',
                    path: fs.absolute(localFilePath)
                });
            }
        }

        let globalFilePath = this.fileExists(this.globalFolder + '/' + path, this.types);

        if (globalFilePath) {
            return q.resolve({
                type: 'local',
                path: globalFilePath
            });
        }

        return q.reject(new Error('File not found'));
    }

    /**
     * Check if file exists and returns the path
     *
     * @param path
     * @param possibleExtensions
     * @returns {*}
     */
    fileExists(path, possibleExtensions) {
        if (fs.existsSync(path)) {
            return path;
        }

        if (!_.isUndefined(possibleExtensions)) {
            for (var i = 0; i < possibleExtensions.length; i++) {
                if (this.fileExists(path + '.' + possibleExtensions[i])) {
                    return path + '.' + possibleExtensions[i];
                }
            }
        }

        return false;
    }

    /**
     * Get the local .edd folder
     *
     * @param targetFile
     * @param startingPoint
     * @param levels
     * @returns {*}
     */
    getLocalFolder(targetFile, startingPoint, levels) {
        if (!targetFile) {
            targetFile = '.edd'
        }

        if (!startingPoint) {
            startingPoint = './';
        }

        if (!levels) {
            levels = fs.absolute(startingPoint).split('/').length;

            //Checks if a windows machines
            if (levels == 1) {
                levels = fs.absolute(startingPoint).split('\\').length;
            }
        }

        if (fs.existsSync((startingPoint + '/' + targetFile))) {
            return (startingPoint + '/' + targetFile).replace('//', '/');
        }

        if ((levels - 1) != 0) {
            return this.getLocalFolder(targetFile, startingPoint + '../', (levels - 1));
        }

        return false;
    }
}

export let Loader = new ClassLoader();

