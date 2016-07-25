'use strict';

var q = require('q'),
  fs = require('fs-plus'),
  yaml = require('js-yaml');

var types = {
  json: ['json'],
  yaml: ['yaml', 'yml']
};

var resolveFileType = function (fileName) {
  var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
  for (var type in types) {
    if (types[type].includes(ext)) {
      return type;
    }
  }
  throw new Error('The file is of an unsupported format');
};

var rawRead = function (path) {
  var reader = q.defer();
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

module.exports.read = function (path) {
  var type = resolveFileType(path);
  return parse[type](rawRead(path));
};

exports = module.exports;
