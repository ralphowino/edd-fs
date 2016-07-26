'use strict';

var fs = require('fs-plus'),
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

var rawRead = function (path) {
  return fs.readFileSync(path);
};

var readYaml = function (data) {
  return yaml.safeLoad(data);
};

var readJson = function (data) {
  return JSON.parse(data);
};

var parse = {
  json: readJson,
  yaml: readYaml
};

exports.read = function (path) {
  var type = resolveFileType(path);
  var content = rawRead(path).toString();
  if (typeof parse[type] == 'function') {
    return parse[type](content);
  }
  return content;
};


