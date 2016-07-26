'use strict';

var fs = require('fs-plus'),
  q = require('q'),
  yaml = require('js-yaml'),
  _ = require('lodash');

var types = {
  json: ['json'],
  yaml: ['yaml', 'yml']
};

var resolveFileType = function (fileName) {
  var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
  for (var type in types) {
    if (_.includes(types[type], ext)) {
      return type;
    }
  }
  return ext;
};

var parseYaml = function (data) {
  return yaml.safeLoad(data);
};

var parseJson = function (data) {
  return JSON.parse(data);
};

var parse = {
  json: parseJson,
  yaml: parseYaml
};

exports.read = function (path) {
  var type = resolveFileType(path);
  var defered = q.defer();
  fs.readFile(path, function (err, data) {
    if (err) {
      defered.reject(new Error(err));
    } else {
      if (typeof parse[type] == 'function') {
        defered.resolve(parse[type](data));
      } else {
        defered.resolve(data);
      }
    }
  });
  return defered.promise;
};
