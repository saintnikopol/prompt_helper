import { listFilesAndContent } from './lister.lib.js';
// Start listing from the current directory
const args = process.argv.slice(2);
const [path = '.'] = args;
listFilesAndContent(path);
