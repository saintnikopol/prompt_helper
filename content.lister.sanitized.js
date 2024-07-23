import { listFilesAndContent } from './lister.lib.sanitized.js';
// Start listing from the current directory
const args = process.argv.slice(2);
const [path = '.'] = args;

// // Start listing from the current directory with sanitization
async function main() {
  await listFilesAndContent(path, '', {
    sanitize: true,
    passwordFile: '/Users/user/git/at/my_lib/passwords.txt'
  });
}

main().catch(console.error);