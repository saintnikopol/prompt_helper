import { listFilesAndContent } from './lister.lib.js';
// Start listing from the current directory
listFilesAndContent('.', '', { srcOnly: true });