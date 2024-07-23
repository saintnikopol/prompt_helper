import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Promisify fs functions
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const realpath = promisify(fs.realpath);

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

// Function to read passwords from a file
async function readPasswordsFromFile(passwordFile) {
    try {
        const content = await readFile(passwordFile, 'utf8');
        const passwords = content.split('\n').filter(Boolean);
        const passwordReplacementDictionary = new Map();
        passwords.forEach((pass, index) => {
            passwordReplacementDictionary.set(pass, `__passwordhidden${index + 1}__`);
        });
        return passwordReplacementDictionary;
    } catch (error) {
        console.error(`Error reading password file: ${error.message}`);
        return new Map();
    }
}

// Function to sanitize content
function sanitizeContent(content, passwordReplacementDictionary) {
    let sanitizedContent = '' + content;
    for (const [password, replacement] of passwordReplacementDictionary) {
        sanitizedContent = sanitizedContent.replace(new RegExp(password, 'g'), replacement);
    }
    return sanitizedContent;
}

async function collectFileStructure(dirPath, baseDir = '', options = {}) {
    const { srcOnly } = options;
    const structure = [];

    try {
        const files = await readdir(dirPath, { withFileTypes: true });
        files.sort((a, b) => a.name.localeCompare(b.name));

        for (const file of files) {
            const relativeFilePath = path.join(baseDir, file.name);
            const fileExtension = path.extname(file.name);
            const filePath = path.join(dirPath, file.name);

            const stats = await lstat(filePath);
            let finalPath = filePath;
            if (stats.isSymbolicLink()) {
                finalPath = await realpath(filePath);
            }

            if ((await lstat(finalPath)).isDirectory()) {
                if (!ignoredDirs.includes(file.name)) {
                    structure.push(relativeFilePath);
                    const subStructure = await collectFileStructure(finalPath, relativeFilePath, options);
                    structure.push(...subStructure);
                }
            } else if (
                !ignoredExtensions.includes(fileExtension) &&
                !ignoredFilesOrDirs.includes(file.name) &&
                !ignoredFilePatterns.some(pattern => file.name.includes(pattern))
            ) {
                if (!srcOnly || relativeFilePath.startsWith('src')) {
                    structure.push(relativeFilePath);
                }
            }
        }
    } catch (error) {
        console.error("Error reading directory:", error);
    }

    return structure;
}

async function listFilesAndContentInternal(dirPath, baseDir = '', options = {}) {
    const { filenamesOnly, srcOnly, sanitize, passwordFile } = options;
    const passwordReplacementDictionary = sanitize && passwordFile ? await readPasswordsFromFile(passwordFile) : new Map();

    try {
        const files = await readdir(dirPath, { withFileTypes: true });
        files.sort((a, b) => a.name.localeCompare(b.name));

        for (const file of files) {
            const relativeFilePath = path.join(baseDir, file.name);
            const fileExtension = path.extname(file.name);
            const filePath = path.join(dirPath, file.name);

            const stats = await lstat(filePath);
            let finalPath = filePath;
            if (stats.isSymbolicLink()) {
                finalPath = await realpath(filePath);
            }

            if ((await lstat(finalPath)).isDirectory()) {
                if (!ignoredDirs.includes(file.name)) {
                    await listFilesAndContentInternal(finalPath, relativeFilePath, options);
                }
            } else if (
                !ignoredExtensions.includes(fileExtension) &&
                !ignoredFilesOrDirs.includes(file.name) &&
                !ignoredFilePatterns.some(pattern => file.name.includes(pattern))
            ) {
                if (!srcOnly || relativeFilePath.startsWith('src')) {
                    if (!filenamesOnly) {
                        try {
                            let content = await readFile(finalPath, 'utf8');
                            if (sanitize) {
                                content = sanitizeContent(content, passwordReplacementDictionary);
                            }
                            console.log("\n" + relativeFilePath + ":");
                            console.log(`<${relativeFilePath}>`);
                            console.log(content);
                            console.log(`</${relativeFilePath}>`);
                        } catch (error) {
                            console.error(`Error reading file ${relativeFilePath}:`, error);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error reading directory:", error);
    }
}

export async function listFilesAndContent(dirPath, baseDir = '', options = {}) {
    const structure = await collectFileStructure(dirPath, baseDir, options);
    console.log("Directory structure:");
    structure.forEach(item => console.log(item));
    console.log("\nFile contents:");
    await listFilesAndContentInternal(dirPath, baseDir, options);
}
