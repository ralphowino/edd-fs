var program = require('commander');

import {Copier} from '../components/copy';
import {Loader} from '../components/loader';

class ClassCommandRead {
    init() {
        program
            .command('read')
            .description('Reads a json or yaml file and dumps its contents on the console')
            .arguments('<path>', "The path of the file to read")
            .action(this.handle)
            .parse(process.argv);
    }

    handle(path) {
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
}

export let CommandRead = new ClassCommandRead();