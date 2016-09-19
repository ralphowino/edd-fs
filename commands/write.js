var program = require('commander'),
    q = require('q'),
    fs = require('fs-plus');

import {Writer} from '../components/writer';

class ClassCommandWrite {
    init() {
        program
            .command('write')
            .description('Writes data to a specified file')
            .arguments('<path> <data>', "The path of the file to write", "Data to write")
            .action(this.handle)
            .parse(process.argv);
    }

    handle(path, content) {
        if (path == undefined) {
            throw new Error('Required argument `path` not provided');
        }

        if (content == undefined) {
            throw new Error('Required argument `data` not provided');
        }

        Writer.write(path, content)
            .then(function () {
                console.log('Files written successfully');
            })
            .catch(function (err) {
                console.log(err ? err : '');
            });
    }
}
export let CommandWrite = new ClassCommandWrite();


