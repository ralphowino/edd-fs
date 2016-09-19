var
    _ = require('lodash'),
    q = require('q'),
    inquirer = require('inquirer'),
    path = require('path'),
    fs = require('fs-plus');

class ClassWriter {

    writeFile(file_path, content) {
        var defered = q.defer();
        var dir = path.dirname(file_path);
        if (!fs.existsSync(dir)) {
            fs.makeTreeSync(dir);
        }

        if (_.isObject(content) || _.isArray(content)) {
            content = JSON.stringify(content)
        }
        fs.writeFile(file_path, content, function (err) {
            if (err) {
                return defered.reject(new Error(err));
            }
            defered.fulfill(file_path);
        });
        return defered.promise;
    }

    askToOverwrite() {
        var question = {
            type: "confirm",
            name: "overwrite",
            message: "The file already exists, do you want to overwrite it?",
            default: false
        };
        return inquirer.prompt([question]);
    };

    write(path, content) {
        if (!fs.existsSync(path)) {
            return this.writeFile(path, content);
        }

        return this.askToOverwrite().then(function (response) {
            if (response.overwrite) {
                return this.writeFile(path, content);
            }
            return q.reject('File already exists');
        });
    }

    mkdir(path) {
        var deferred = q.defer();
        fs.makeTree(path, function (err) {
            if (err) {
                return deferred.reject(err);
            }
            return deferred.fulfill();
        });
        return deferred.promise;
    }
}
export let Writer = new ClassWriter();