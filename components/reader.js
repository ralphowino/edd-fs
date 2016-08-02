'use strict';

var fs = require('fs-plus');
var path = require('path');
var q = require('q');
var yaml = require('js-yaml');
var _ = require('lodash');

var types = {
  json: ['json'],
  yaml: ['yaml', 'yml']
};

var resolveFileType = function (fileName) {
  var ext = path.extname(fileName).substr(1);
  for (var type in types) {
    if (_.includes(types[type], ext)) {
      return type;
    }
  }
  return ext;
};

var parseYaml = function (data) {
  return yaml.load(data);
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
  fs.readFile(path, function (err, content) {
    let data = content.toString();
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
