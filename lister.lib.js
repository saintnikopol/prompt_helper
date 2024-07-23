import fs from 'fs';
import path from 'path';


// Extensions to ignore (example: ['.log', '.tmp'])
const ignoredExtensions = [
    '.log', '.tmp', '.lock',
    '.png', '.jpg', '.jpeg', '.pdf'
];

const ignoredFilesOrDirs = [
    'prompt_history.',
    'node_modules',
    '.git',
    '.DS_Store',
    '.vscode',
    '.idea',
    '.gitignore',
    '.gitattributes',
    '.npmignore',
    '.npmrc',
    '.yarnrc',
    '.yarn',
    '.yarnrc.yml',
    '.yarn-integrity',
    '.yarn-metadata.json',
    '.yarn-tarball.tgz',
    '.env',
    'package-lock.json',
    'yarn.lock',
    'compose_prompt.js',
    'currentProject',
    'current.prompt.txt',
];
const ignoredFilePatterns = [
    'prompt_history.',
    'currentProject.',
];

const ignoredDirs = [
    'node_modules',
    '.git',
    '.DS_Store',
    '.vscode',
    '.idea',
    'dist',
];

// Function to list files recursively with their content, ignoring specific file extensions
function listFilesAndContentInternal(dirPath, baseDir = '', { filenamesOnly = false, srcOnly = false, rootCall = false } = {}) {
    fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        files.forEach(file => {
            const relativeFilePath = path.join(baseDir, file.name);
            const fileExtension = path.extname(file.name);

            if (
                file.isDirectory()
            ) {
                if (ignoredDirs.includes(file.name)) {
                    return;
                }
                // If it's a directory, recurse into it
                listFilesAndContentInternal(path.join(dirPath, file.name), relativeFilePath, { filenamesOnly, srcOnly });
            } else if (
                !ignoredExtensions.includes(fileExtension) &&
                !ignoredFilesOrDirs.includes(file.name) &&
                !ignoredFilePatterns.some(pattern => file.name.includes(pattern))
            ) {
                // If it's a file and not in the ignored list, read and display its content
                if (srcOnly && !relativeFilePath.startsWith('src')) {
                    return;
                }
                console.log(relativeFilePath);
                if (filenamesOnly) {
                    return;
                }
                fs.readFile(path.join(dirPath, file.name), 'utf8', (err, content) => {
                    if (err) {
                        console.error("Error reading file:", err);
                        return;
                    }
                    console.log("\n" + relativeFilePath + ":");

                    console.log(`<${relativeFilePath}>`); // Start of content
                    console.log(content);
                    console.log(`</${relativeFilePath}>`); // End of content
                });
            }
        });

    });
}

export function listFilesAndContent(dirPath, baseDir = '', { filenamesOnly = false, srcOnly = false } = {}) {
    listFilesAndContentInternal(dirPath, baseDir, { filenamesOnly, srcOnly, rootCall: true });
}
