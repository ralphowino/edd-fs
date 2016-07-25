var q = require('q'),
  fs = require('fs-plus');

module.exports.write = function (path, content) {
  var deferred = q.defer();
  //Todo: check if exists and follow overwrite instructions
  fs.writeFile(path, content, undefined, function (err) {
    "use strict";
    if (err) {
      return deferred.reject(err);
    }
    return deferred.fulfill();
  });
  return deferred.promise;
};

module.exports.mkdir = function (path) {
  "use strict";
  var deferred = q.defer();
  //Todo: check if exists and follow overwrite instructions
  fs.makeTree(path, function (err) {
    "use strict";
    if (err) {
      return deferred.reject(err);
    }
    return deferred.fulfill();
  });
  return deferred.promise;
}


exports = module.exports;