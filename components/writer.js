var q = require('q'),
  inquirer = require('inquirer'),
  path = require('path'),
  fs = require('fs-plus');


var writeFile = function (file_path, content) {
  var defered = q.defer();
  var dir = path.dirname(file_path);
  if (!fs.existsSync(dir)) {
    fs.makeTreeSync(dir);
  }

  // Checks if the content is JSON and stringifyies it
  if(IsJsonString(content)){
    content = JSON.stringify(content);
  }

  fs.writeFile(file_path, content, function (err) {
    if (err) {
      defered.reject(new Error(err));
    } else {
      defered.resolve();
    }
  });
  return defered.promise;
};


function IsJsonString(content) {
  try {
    JSON.stringify(content);
  } catch (e) {
    return false;
  }
  return true;
}

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
  var defered = q.defer();
  if (!fs.existsSync(path)) {
    return writeFile(path, content);
  }

  return askToOverwrite().then(function (response) {
    if (response.overwrite) {
      return writeFile(path, content);
    }
    defered.reject();
    return defered.promise;
  });
};

module.exports.mkdir = function (path) {
  "use strict";
  var deferred = q.defer();
  fs.makeTree(path, function (err) {
    "use strict";
    if (err) {
      return deferred.reject(err);
    }
    return deferred.fulfill();
  });
  return deferred.promise;
};
