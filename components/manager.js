var q = require('q');

import {Output} from '../../edd-io/index';
import {Writer} from './writer';

class ClassManager {
    constructor() {
        this.basePath = process.cwd() + '/';
        this.eddiePath = this.basePath.concat('.edd/');
        this.eddieFile = this.eddiePath.concat('edd-config.json');
    }

    init() {
        Output.info('initializing');
        var config = {version: '0.0.1'};

        return Writer
            .write(this.eddieFile, JSON.stringify(config))
            .then((file)=> {
                    let process = [];
                    Output.success('edd successfully initialized at' + file);

                    process.push(Writer.mkdir(this.eddiePath.concat('libraries')).then(()=> {
                        Output.success('Created libraries folder')
                    }, ()=> {
                        console.log(arguments)
                    }));
                    process.push(Writer.mkdir(this.eddiePath.concat('templates')));

                    return q.all(process);
                },
                (err) => {
                    Output.error(err);
                });
    }
}
export let Manager = new ClassManager();