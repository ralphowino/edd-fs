var program = require('commander'),
    q = require('q'),
    fs = require('fs-plus');

import {Input} from '../../edd-io/index';
import {Manager} from '../components/manager';

class ClassCommandInit {
    init() {
        program
            .command('init')
            .description('Initialize a new edd instance')
            .option('-f, --force', 'Force re-initialization if already existing')
            .action(this.handle);
    }

    handle() {
        var overwrite = program.force;
        if (fs.existsSync(Manager.eddiePath)) {
            overwrite = Input.confirm('edd is already initialized, do you want to re-initialize it', false);
            q.resolve(overwrite).then(function (force) {
                if (force) {
                    Manager.init(force);
                }
            });
        } else {
            Manager.init();
        }
    }
}

export let CommandInit = new ClassCommandInit();