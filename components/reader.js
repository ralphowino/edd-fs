'use strict';

let fs = require('fs-plus');
let path = require('path');
let q = require('q');
let yaml = require('js-yaml');
let _ = require('lodash');

class Reader {

  constructor() {
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

  resolveFileType(fileName) {
    let ext = path.extname(fileName).substr(1);
    let type = _.findIndex(this.types, (type)=> {
      return _.findIndex(type.extensions, ext) != -1;
    });
    return type != -1 ? type : ext;
  }

  parseYaml(data) {
    return yaml.load(data);
  }

  parseJson(data) {
    return JSON.parse(data);
  }

  read(path) {
    let type = this.resolveFileType(path);
    let defered = q.defer();
    fs.readFile(path, (err, content) => {
      let data = content.toString();
      if (err) {
        return defered.reject(new Error(err));
      }
      if (this.types[type]['parser']) {
        return defered.resolve(this[this.types[type]['parser']](data));
      }
      return defered.resolve(data);
    });
    return defered.promise;
  }

  readSync(path) {
    let type = this.resolveFileType(path);
    let data = fs.readFileSync(path);
    data = data.toString();
    if (_.has(this.types, [type, 'parser'])) {
      this[_.get(this.types, [type, 'parser'])](data);
    }
    return data;
  }
}

module.exports = new Reader();