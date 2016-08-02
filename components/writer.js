'use strict';

var
  _ = require('lodash'),
  q = require('q'),
  inquirer = require('inquirer'),
  path = require('path'),
  fs = require('fs-plus');

var writeFile = function (file_path, content) {
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
};


var askToOverwrite = function () {
  var question = {
    type: "confirm",
    name: "overwrite",
    message: "The file already exists, do you want to overwrite it?",
    default: false
  };
  return inquirer.prompt([question]);
};

module.exports.write = function (path, content) {
  if (!fs.existsSync(path)) {
    return writeFile(path, content);
  }

  return askToOverwrite().then(function (response) {
    if (response.overwrite) {
      return writeFile(path, content);
    }
    return q.reject('File already exists');
  });
};

module.exports.mkdir = function (path) {
  var deferred = q.defer();
  fs.makeTree(path, function (err) {
    if (err) {
      return deferred.reject(err);
    }
    return deferred.fulfill();
  });
  return deferred.promise;
};
