export {Writer} from './components/writer';
export {Loader} from './components/loader';
export {Reader} from './components/reader';
export {Manager} from './components/manager';
export {FileSystem} from './components/filesystem';

import {CommandInit} from './commands/init';
import {CommandRead} from './commands/read';
import {CommandWrite} from './commands/write';

export function init() {
  CommandInit.init();
  CommandRead.init();
  CommandWrite.init();
}


