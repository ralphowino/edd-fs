(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.fs = global.fs || {})));
}(this, (function (exports) { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _ = require('lodash');
var q = require('q');
var inquirer = require('inquirer');
var path = require('path');
var fs = require('fs-plus');
var ClassWriter = function () {
    function ClassWriter() {
        classCallCheck(this, ClassWriter);
    }

    createClass(ClassWriter, [{
        key: 'writeFile',
        value: function writeFile(file_path, content) {
            var defered = q.defer();
            var dir = path.dirname(file_path);
            if (!fs.existsSync(dir)) {
                fs.makeTreeSync(dir);
            }

            if (_.isObject(content) || _.isArray(content)) {
                content = JSON.stringify(content);
            }
            fs.writeFile(file_path, content, function (err) {
                if (err) {
                    return defered.reject(new Error(err));
                }
                defered.fulfill(file_path);
            });
            return defered.promise;
        }
    }, {
        key: 'askToOverwrite',
        value: function askToOverwrite() {
            var question = {
                type: "confirm",
                name: "overwrite",
                message: "The file already exists, do you want to overwrite it?",
                default: false
            };
            return inquirer.prompt([question]);
        }
    }, {
        key: 'write',
        value: function write(path, content) {
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
    }, {
        key: 'mkdir',
        value: function mkdir(path) {
            var deferred = q.defer();
            fs.makeTree(path, function (err) {
                if (err) {
                    return deferred.reject(err);
                }
                return deferred.fulfill();
            });
            return deferred.promise;
        }
    }]);
    return ClassWriter;
}();

var Writer = new ClassWriter();

var fs$2 = require('fs-plus');
var path$1 = require('path');
var q$2 = require('q');
var yaml = require('js-yaml');
var _$2 = require('lodash');
var ClassReader = function () {
  function ClassReader() {
    classCallCheck(this, ClassReader);

    this.types = {
      json: {
        extensions: ['json'],
        parser: 'parseJson'
      },
      yaml: {
        extensions: ['yaml', 'yml'],
        parser: 'parseYaml'
      }
    };
  }

  createClass(ClassReader, [{
    key: 'resolveFileType',
    value: function resolveFileType(fileName) {
      var ext = path$1.extname(fileName).substr(1);
      var type = _$2.findIndex(this.types, function (type) {
        return _$2.findIndex(type.extensions, ext) != -1;
      });
      return type != -1 ? type : ext;
    }
  }, {
    key: 'parseYaml',
    value: function parseYaml(data) {
      return yaml.load(data);
    }
  }, {
    key: 'parseJson',
    value: function parseJson(data) {
      return JSON.parse(data);
    }
  }, {
    key: 'read',
    value: function read(path) {
      var _this = this;

      var type = this.resolveFileType(path);
      var defered = q$2.defer();
      fs$2.readFile(path, function (err, content) {
        var data = content.toString();
        if (err) {
          return defered.reject(new Error(err));
        }
        if (_this.types[type]['parser']) {
          return defered.resolve(_this[_this.types[type]['parser']](data));
        }
        return defered.resolve(data);
      });
      return defered.promise;
    }
  }, {
    key: 'readSync',
    value: function readSync(path) {
      var type = this.resolveFileType(path);
      var data = fs$2.readFileSync(path);
      data = data.toString();
      if (_$2.has(this.types, [type, 'parser'])) {
        this[_$2.get(this.types, [type, 'parser'])](data);
      }
      return data;
    }
  }]);
  return ClassReader;
}();

var Reader = new ClassReader();

var q$1 = require('q');
var _$1 = require('lodash');
var fs$1 = require('fs-plus');

var ClassLoader = function () {
    function ClassLoader() {
        classCallCheck(this, ClassLoader);

        this.types = ['json', 'yaml', 'yml'];
        this.globalFolder = fs$1.getHomeDirectory() + '/.edd/';
    }

    /**
     * Load a file given the file's path
     *
     * @param path
     * @returns {*}
     */


    createClass(ClassLoader, [{
        key: 'loadFile',
        value: function loadFile(path) {
            var _this = this;

            return this.getRealPath(path).then(function (response) {
                return _this.readFile(response.path).then(function (content) {
                    response.content = content;
                    return response;
                });
            });
        }

        /**
         * Load a file given the file's path
         *
         * @param path
         * @returns {*}
         */

    }, {
        key: 'loadFileSync',
        value: function loadFileSync(path) {
            var _this2 = this;

            return this.getRealPath(path).then(function (response) {
                return _this2.readFile(response.path).then(function (content) {
                    response.content = content;
                    return response;
                });
            });
        }
    }, {
        key: 'readFile',
        value: function readFile(path) {
            if (fs$1.existsSync(path)) {
                return Reader.read(path);
            }
            return q$1.reject(new Error('File does not exist'));
        }

        /**
         * Get the real path to the file specified
         *
         * @param path
         * @returns {*}
         */

    }, {
        key: 'getRealPath',
        value: function getRealPath(path) {
            // Check if path is absolute and return the absolute path
            if (fs$1.isAbsolute(path)) {
                return q$1.resolve({
                    type: 'absolute',
                    path: path
                });
            }

            // Check and if exists return the local path
            var localFolder = this.getLocalFolder();

            if (localFolder) {
                var localFilePath = this.fileExists(localFolder + '/' + path, this.types);

                if (localFilePath) {
                    return q$1.resolve({
                        type: 'local',
                        path: fs$1.absolute(localFilePath)
                    });
                }
            }

            var globalFilePath = this.fileExists(this.globalFolder + '/' + path, this.types);

            if (globalFilePath) {
                return q$1.resolve({
                    type: 'local',
                    path: globalFilePath
                });
            }

            return q$1.reject(new Error('File not found'));
        }

        /**
         * Check if file exists and returns the path
         *
         * @param path
         * @param possibleExtensions
         * @returns {*}
         */

    }, {
        key: 'fileExists',
        value: function fileExists(path, possibleExtensions) {
            if (fs$1.existsSync(path)) {
                return path;
            }

            if (!_$1.isUndefined(possibleExtensions)) {
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

    }, {
        key: 'getLocalFolder',
        value: function getLocalFolder(targetFile, startingPoint, levels) {
            if (!targetFile) {
                targetFile = '.edd';
            }

            if (!startingPoint) {
                startingPoint = './';
            }

            if (!levels) {
                levels = fs$1.absolute(startingPoint).split('/').length;

                //Checks if a windows machines
                if (levels == 1) {
                    levels = fs$1.absolute(startingPoint).split('\\').length;
                }
            }

            if (fs$1.existsSync(startingPoint + '/' + targetFile)) {
                return (startingPoint + '/' + targetFile).replace('//', '/');
            }

            if (levels - 1 != 0) {
                return this.getLocalFolder(targetFile, startingPoint + '../', levels - 1);
            }

            return false;
        }
    }]);
    return ClassLoader;
}();

var Loader = new ClassLoader();

var inquirer$1 = require('inquirer');

var ClassInquirer = function () {
    function ClassInquirer() {
        classCallCheck(this, ClassInquirer);
    }

    createClass(ClassInquirer, [{
        key: 'loopQuestions',
        value: function loopQuestions(questions_array, index, answers) {
            if (!index) {
                index = 0;
            }

            if (!answers) {
                answers = {};
            }

            return inquirer$1.prompt(questions_array[index]).then(function (answer) {
                Object.assign(answers, answer);

                if (index === questions_array.length - 1) {
                    return answers;
                } else {
                    return this.loopQuestions(questions_array, index + 1, answers);
                }
            });
        }

        /**
         * Modified version of inquirer prompt function
         * @param questions_array
         * @returns {Promise<T>|Promise}
         */

    }, {
        key: 'prompt',
        value: function prompt(questions_array) {
            return new Promise(function (resolve) {
                return resolve(this.loopQuestions(questions_array));
            });
        }
    }]);
    return ClassInquirer;
}();

var Inquirer = new ClassInquirer();

var _$4 = require('lodash');

var ClassTransformers = function () {
    function ClassTransformers() {
        classCallCheck(this, ClassTransformers);
    }

    createClass(ClassTransformers, [{
        key: 'transformArrayField',
        value: function transformArrayField(field) {
            // return input.choose(field.title + '. What do we do next', [
            // 	{	value: 'add',  name: 'Add'},
            // 	{	value: 'stop', name: 'Stop'}
            // ]).then(function ( selected ) {
            // 	if (selected == 'stop')
            // 		return answers;
            // 	var items = _.map(field.items, function (item) {
            // 		return item.replace(field.key.concat('[].'), '');
            // 	});
            // 	return input.fields(field.schema.items, items).then(function (answer) {
            // 		answers.push(answer);
            // 		return input.askArrayQuestion(field, answers)
            // 	})
            // });
        }
    }, {
        key: 'transformBooleanField',
        value: function transformBooleanField(field) {
            return {
                name: field.key,
                message: field.title ? field.title : field.key,
                type: 'confirm'
            };
        }

        // transformCheckboxField(field) {
        // 	return {
        // 		name: field.key,
        // 		message: field.title ? field.title : field.key,
        // 		choices: choices,
        // 		default: _default
        // 	}
        // }

    }, {
        key: 'transformDefaultField',
        value: function transformDefaultField(field, answer) {
            return {
                name: field.key,
                message: field.title ? field.title : field.key,
                type: 'input',
                default: _$4.isUndefined(answer) ? field.default : answer
            };
        }
    }, {
        key: 'transformHelpField',
        value: function transformHelpField(field, answer) {
            console.log('no transform available for help text');
            return null;
        }
    }, {
        key: 'transformIntegerField',
        value: function transformIntegerField(field, answer) {
            return {
                name: field.key,
                message: field.title ? field.title : field.key,
                type: 'input',
                default: _$4.isUndefined(answer) ? field.default : answer //TODO add validate function
            };
        }
    }, {
        key: 'transformNumberField',
        value: function transformNumberField(field, answer) {
            return {
                name: field.key,
                message: field.title ? field.title : field.key,
                type: 'input',
                default: _$4.isUndefined(answer) ? field.default : answer //TODO add validate function
            };
        }
    }, {
        key: 'transformStringField',
        value: function transformStringField(field, answer) {
            var question = transformers.transformDefaultField(field, answer);

            if (field.enum) {
                var choices = _$4.map(field.enum, function (item) {
                    return { value: item, name: item };
                });
                question.type = 'rawlist';
                question.choices = choices;
            }
            return question;
        }
    }, {
        key: 'transformSubmitField',
        value: function transformSubmitField(field, answer) {
            console.log('no transform available for submit buttons');
            return null;
        }
    }, {
        key: 'transformTextareaField',
        value: function transformTextareaField(field, answer) {
            return {
                name: field.key,
                message: field.title ? field.title : field.key,
                type: 'input',
                default: _$4.isUndefined(answer) ? field.default : answer
            };
        }
    }]);
    return ClassTransformers;
}();

var Transformers = new ClassTransformers();

var _$3 = require('lodash');

var ClassFields = function () {
    function ClassFields() {
        classCallCheck(this, ClassFields);
    }

    createClass(ClassFields, [{
        key: 'askQuestions',
        value: function askQuestions(form, default_model) {
            var questions = this.getQuestions(form, default_model);
            return Inquirer.prompt(questions);
        }
    }, {
        key: 'getArrayFields',
        value: function getArrayFields(schema, parent_field) {
            var array_form = [];
            var array_schema = _$3.cloneDeep(_$3.get(schema, ['properties', parent_field.key]));
            _$3.forEach(parent_field.items, function (item_field) {
                if (_$3.isString(item_field)) {
                    item_field = { key: item_field };
                }
                item_field.key = item_field.key.replace(parent_field.key + '[].', ''); // Remove the array key prefix
                array_form.push(this.getNormalField(array_schema, item_field));
            });
            return array_form;
        }
    }, {
        key: 'getAsteriskFields',
        value: function getAsteriskFields(schema, schema_form) {
            var fields = _$3.cloneDeep(_$3.get(schema, ['properties']));
            _$3.forEach(fields, function (object, field) {
                field = { key: field };
                schema_form.push(this.getNormalField(schema, field));
            });
            return schema_form;
        }
    }, {
        key: 'getNormalField',
        value: function getNormalField(schema, field) {
            var field_schema = _$3.cloneDeep(_$3.get(schema, ['properties', field.key]));
            if (_$3.isUndefined(field_schema)) field_schema = _$3.cloneDeep(_$3.get(schema.items, ['properties', field.key])); //check for array

            field = _$3.merge(field_schema, _$3.get(field, ['schema', 'x-schema-form'], {}), field);

            if (field.type === 'array') {
                field = this.getArrayFields(schema, field); // Make the field an array of the objects properties
            }

            return field;
        }
    }, {
        key: 'getQuestions',
        value: function getQuestions(array_fields, default_model) {
            var type,
                questions = [];
            _$3.forEach(array_fields, function (field) {
                "use strict";

                var question;

                if (_$3.isArray(field)) {
                    question = this.getQuestions(field, default_model);
                } else {
                    type = 'transform' + _$3.capitalize(field.type) + 'Field';
                    if (!Transformers[type]) {
                        console.error(type);
                        type = 'transformDefaultField';
                    }
                    question = Transformers[type](field, _$3.get(default_model, field.key));
                }

                if (question != null) {
                    return questions.push(question);
                }
            });
            return questions;
        }
    }, {
        key: 'queries',
        value: function queries(schema, form, model) {
            var schema_form = [];

            _$3.forEach(form, function (field) {
                if (_$3.isString(field)) {
                    field = { key: field };
                }

                if (field.key !== '*') {
                    // normal fields
                    schema_form.push(this.getNormalField(schema, field));
                } else if (field.key === '*') {
                    // dynamic form indicated by asterisk to indicate all fields
                    this.getAsteriskFields(schema, schema_form);
                }
            });
            return this.askQuestions(schema_form, model);
        }
    }]);
    return ClassFields;
}();

var Fields = new ClassFields();

var inquirer$2 = require('inquirer');

var ClassInput = function () {
    function ClassInput() {
        classCallCheck(this, ClassInput);
    }

    createClass(ClassInput, [{
        key: 'ask',
        value: function ask(message, _default) {
            return inquirer$2.prompt([{
                name: 'response',
                message: message,
                type: 'input',
                default: _default
            }]).then(function (answers) {
                return answers.response;
            });
        }
    }, {
        key: 'secret',
        value: function secret(message, _default) {
            console.log(message);
            return inquirer$2.prompt([{
                name: 'response',
                message: message,
                type: 'password',
                default: _default
            }]).then(function (answers) {
                return answers.response;
            });
        }
    }, {
        key: 'confirm',
        value: function confirm(message, _default) {
            return inquirer$2.prompt([{
                name: 'response',
                message: message,
                type: 'confirm',
                default: _default
            }]).then(function (answers) {
                return answers.response;
            });
        }
    }, {
        key: 'choose',
        value: function choose(message, choices, _default) {
            return inquirer$2.prompt([{
                name: 'response',
                message: message,
                type: 'list',
                choices: choices,
                default: _default
            }]).then(function (answers) {
                return answers.response;
            });
        }
    }, {
        key: 'choice',
        value: function choice(question, choices, selected) {
            "use strict";

            return inquirer$2.prompt([{
                name: 'response',
                message: question,
                type: 'list',
                choices: choices,
                default: selected
            }]).then(function (answers) {
                return answers.response;
            });
        }
    }]);
    return ClassInput;
}();

var Input = new ClassInput();

var chalk = require('chalk');
var Spinner = require('cli-spinner').Spinner;
var _$5 = require('lodash');
var ClassOutput = function () {
  function ClassOutput() {
    classCallCheck(this, ClassOutput);
  }

  createClass(ClassOutput, [{
    key: 'line',
    value: function line() {
      _$5.each(arguments, function (message) {
        if (!_$5.isString(message)) {
          message = JSON.stringify(message);
        }
        console.log(message);
      });
    }
  }, {
    key: 'info',
    value: function info() {
      _$5.each(arguments, function (message) {
        if (!_$5.isString(message)) {
          message = JSON.stringify(message);
        }
        console.info(chalk.cyan(message));
      });
    }
  }, {
    key: 'success',
    value: function success() {
      _$5.each(arguments, function (message) {
        if (!_$5.isString(message)) {
          message = JSON.stringify(message);
        }
        console.info(chalk.green(message));
      });
    }
  }, {
    key: 'error',
    value: function error() {
      _$5.each(arguments, function (message) {
        if (!_$5.isString(message)) {
          message = JSON.stringify(message);
        }
        console.error(chalk.white.bgRed(message));
      });
    }
  }, {
    key: 'warning',
    value: function warning() {
      _$5.each(arguments, function (message) {
        if (!_$5.isString(message)) {
          message = JSON.stringify(message);
        }
        console.warn(chalk.yellow(message));
      });
    }
  }, {
    key: 'spinner',
    value: function spinner(message) {
      var spinner = new Spinner(message + '...%s');
      spinner.setSpinnerString('|/-\\');
      return spinner;
    }
  }]);
  return ClassOutput;
}();

var Output = new ClassOutput();

var q$3 = require('q');

var ClassManager = function () {
    function ClassManager() {
        classCallCheck(this, ClassManager);

        this.basePath = process.cwd() + '/';
        this.eddiePath = this.basePath.concat('.edd/');
        this.eddieFile = this.eddiePath.concat('edd-config.json');
    }

    createClass(ClassManager, [{
        key: 'init',
        value: function init() {
            var _this = this,
                _arguments = arguments;

            Output.info('initializing');
            var config = { version: '0.0.1' };

            return Writer.write(this.eddieFile, JSON.stringify(config)).then(function (file) {
                var process = [];
                Output.success('edd successfully initialized at' + file);

                process.push(Writer.mkdir(_this.eddiePath.concat('libraries')).then(function () {
                    Output.success('Created libraries folder');
                }, function () {
                    console.log(_arguments);
                }));
                process.push(Writer.mkdir(_this.eddiePath.concat('templates')));

                return q$3.all(process);
            }, function (err) {
                Output.error(err);
            });
        }
    }]);
    return ClassManager;
}();

var Manager = new ClassManager();

var q$4 = require('q');
var fs$3 = require('fs-plus');
var ClassFileSystem = function () {
    function ClassFileSystem() {
        classCallCheck(this, ClassFileSystem);

        this.globalFolder = fs$3.getHomeDirectory() + '/.edd/';
    }

    /**
     * Checks for the file and reads the content of the file if the file is present
     *
     * @param path
     * @param content
     * @returns {*}
     */


    createClass(ClassFileSystem, [{
        key: 'writeToLocalFile',
        value: function writeToLocalFile(path, content) {
            var deferred = q$4.defer();

            Writer.write(this.getLocalFolder() + '/' + path, content).then(function () {
                return deferred.resolve('Successfully wrote to the file');
            }, function (err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        }

        /**
         * Checks for the file and reads the content of the file if the file is present
         *
         * @param path
         * @returns {*}
         */

    }, {
        key: 'readFile',
        value: function readFile(path) {
            var deferred = q$4.defer();

            fs$3.exists(path, function () {
                Reader.read(path).then(function (response) {
                    return deferred.resolve(response);
                }, function (err) {
                    return deferred.reject(err);
                });
            }, function () {
                return deferred.reject(new Error('File does not exist'));
            });

            return deferred.promise;
        }

        /**
         * Recursively searches up the file system for a file
         *
         * @param targetFile
         * @param startingPoint
         * @param levels
         * @returns {*} relativeFilePath
         */

    }, {
        key: 'getLocalFolder',
        value: function getLocalFolder(targetFile, startingPoint, levels) {

            if (!targetFile) {
                targetFile = '.edd';
            }

            if (!startingPoint) {
                startingPoint = './';
            }

            if (!levels) {
                levels = FileSystem.fetchDirectoryLevels(startingPoint);
            }

            if (fs$3.existsSync(startingPoint + '/' + targetFile)) {
                return (startingPoint + '/' + targetFile).replace('//', '/');
            }

            if (levels - 1 != 0) {
                return this.getLocalFolder(targetFile, startingPoint + '../', levels - 1);
            }

            return false;
        }

        /**
         * Fetches the levels the current directory is compared to the base directory
         *
         * @param {String} startingPoint
         * @returns {Number} directoryLevels
         */

    }, {
        key: 'localDirectoryExists',


        /**
         * Checks if the local .edd folder exists
         *
         * @returns {boolean}
         */
        value: function localDirectoryExists() {
            return Boolean(this.getLocalFolder());
        }

        /**
         * Reads a file from the local .edd folder
         *
         * @param path
         * @returns {*}
         */

    }, {
        key: 'readLocalFile',
        value: function readLocalFile(path) {
            return this.readFile(this.getLocalFolder() + '/' + path);
        }

        /**
         * Reads a file from the global .edd folder
         *
         * @param path
         * @returns {*}
         */

    }, {
        key: 'readGlobalFile',
        value: function readGlobalFile(path) {
            return this.readFile(this.globalFolder + path);
        }

        /**
         * Build up the response object
         *
         * @param source
         * @param path
         * @param content
         * @returns {{source: *, path: *, content: *}}
         */

    }, {
        key: 'buildResponse',
        value: function buildResponse(source, path, content) {
            return {
                'source': source,
                'path': path,
                'content': content
            };
        }
    }], [{
        key: 'fetchDirectoryLevels',
        value: function fetchDirectoryLevels(startingPoint) {
            var absolute = fs$3.absolute(startingPoint);
            var levels = absolute.split('/').length;

            //Checks if a windows machines
            if (levels == 1) {
                levels = absolute.split('\\').length;
            }

            return levels;
        }
    }]);
    return ClassFileSystem;
}();

var FileSystem = new ClassFileSystem();

var program = require('commander');
var q$5 = require('q');
var fs$4 = require('fs-plus');
var ClassCommandInit = function () {
    function ClassCommandInit() {
        classCallCheck(this, ClassCommandInit);
    }

    createClass(ClassCommandInit, [{
        key: 'init',
        value: function init() {
            program.command('init').description('Initialize a new edd instance').option('-f, --force', 'Force re-initialization if already existing').action(this.handle);
        }
    }, {
        key: 'handle',
        value: function handle() {
            var overwrite = program.force;
            if (fs$4.existsSync(Manager.eddiePath)) {
                overwrite = Input.confirm('edd is already initialized, do you want to re-initialize it', false);
                q$5.resolve(overwrite).then(function (force) {
                    if (force) {
                        Manager.init(force);
                    }
                });
            } else {
                Manager.init();
            }
        }
    }]);
    return ClassCommandInit;
}();

var CommandInit = new ClassCommandInit();

var q$6 = require('q');
var fs$5 = require('fs-plus');

var ClassCopier = function () {
    function ClassCopier() {
        classCallCheck(this, ClassCopier);
    }

    createClass(ClassCopier, [{
        key: 'checkLocalVersion',

        /**
         * Checks if a local version of the file exists and returns the file's contents
         *
         * @param path
         * @returns {*}
         */
        value: function checkLocalVersion(path) {
            var deferred = q$6.defer();

            FileSystem.readLocalFile(path).then(function (fileContent) {
                return deferred.resolve(FileSystem.buildResponse('local', path, fileContent));
            }, function (err) {
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

    }, {
        key: 'fetchGlobalVersion',
        value: function fetchGlobalVersion(path) {
            var deferred = q$6.defer();

            file.readGlobalFile(path).then(function (fileContent) {
                return deferred.resolve(fileContent);
            }, function (err) {
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

    }, {
        key: 'createLocalVersion',
        value: function createLocalVersion(path, content) {
            var deferred = q$6.defer();

            file.writeToLocalFile(path, content).then(function () {
                return deferred.resolve(file.buildResponse('local', path, content));
            }, function (err) {
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

    }, {
        key: 'copyFile',
        value: function copyFile(path) {
            var _this = this;

            var deferred = q$6.defer();

            if (!file.localDirectoryExists()) {
                return deferred.reject(new Error('Local .edd folder does not exist.'));
            }

            this.checkLocalVersion(path).then(function (response) {
                return deferred.resolve(response);
            }, function (err) {
                _this.fetchGlobalVersion(path).then(function (content) {
                    _this.createLocalVersion(path, content).then(function (response) {
                        return deferred.resolve(response);
                    }, function (err) {
                        return deferred.reject(err);
                    });
                }, function (err) {
                    return deferred.reject(err);
                });
            });

            return deferred.promise;
        }
    }]);
    return ClassCopier;
}();

var Copier = new ClassCopier();

var program$1 = require('commander');

var ClassCommandRead = function () {
    function ClassCommandRead() {
        classCallCheck(this, ClassCommandRead);
    }

    createClass(ClassCommandRead, [{
        key: 'init',
        value: function init() {
            program$1.command('read').description('Reads a json or yaml file and dumps its contents on the console').arguments('<path>', "The path of the file to read").action(this.handle).parse(process.argv);
        }
    }, {
        key: 'handle',
        value: function handle(path) {
            //
            // if (path == undefined) {
            //   throw new Error('Required argument `path` not provided');
            // }
            //
            // if (!fs.isFileSync(path)) {
            //   console.error('ERROR: Argument `path` is not a valid file path');
            //   process.exit(1);
            // }
            //
            console.log(path);
            Loader.loadFile(path).then(function (response) {
                console.log(response);
            }, function (err) {
                console.log(err);
            });
            // Copier.copyFile(path).then(function (response) {
            //   console.log(response);
            // }, function (err) {
            //   console.log(err)
            // });
        }
    }]);
    return ClassCommandRead;
}();

var CommandRead = new ClassCommandRead();

var program$2 = require('commander');
var q$7 = require('q');
var fs$6 = require('fs-plus');
var ClassCommandWrite = function () {
    function ClassCommandWrite() {
        classCallCheck(this, ClassCommandWrite);
    }

    createClass(ClassCommandWrite, [{
        key: 'init',
        value: function init() {
            program$2.command('write').description('Writes data to a specified file').arguments('<path> <data>', "The path of the file to write", "Data to write").action(this.handle).parse(process.argv);
        }
    }, {
        key: 'handle',
        value: function handle(path, content) {
            if (path == undefined) {
                throw new Error('Required argument `path` not provided');
            }

            if (content == undefined) {
                throw new Error('Required argument `data` not provided');
            }

            Writer.write(path, content).then(function () {
                console.log('Files written successfully');
            }).catch(function (err) {
                console.log(err ? err : '');
            });
        }
    }]);
    return ClassCommandWrite;
}();

var CommandWrite = new ClassCommandWrite();

function init() {
  CommandInit.init();
  CommandRead.init();
  CommandWrite.init();
}

exports.init = init;
exports.Writer = Writer;
exports.Loader = Loader;
exports.Reader = Reader;
exports.Manager = Manager;
exports.FileSystem = FileSystem;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
