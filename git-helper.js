#!/usr/bin/env node
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

let inquirer;
let chalk;
const { showHelp } = require('./src/helper.js');
const { showStats } = require('./src/stats.js');
const { selectFilesToAdd } = require('./src/add.js');
const { chooseCommitType, getCommitMessage } = require('./src/commit.js');
const { confirmPush } = require('./src/push.js');
const git = simpleGit();

let addedFiles = false;
let committed = false;
let selectedFiles = [];
let gitrm = false;

const gitignoreContent = `
main.c
main.cpp
vgcore*
*.log
*.o
a.out
.history
`.trim();

async function loadDependencies() {
    chalk = (await import('chalk')).default;
    inquirer = (await import('inquirer')).default;
}

async function createGitignore() {
    const gitignorePath = path.join(process.cwd(), '.gitignore');

    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
        console.log(`${chalk.greenBright("Fichier .gitignore créé avec succès.")}`);
    } else {
        console.log(`${chalk.yellow(".gitignore existe déjà. Aucune modification effectuée.")}`);
    }
}

async function displayGitStatus() {
    const currentDirectory = process.cwd();
    try {
        const status = await git.status();
        const currentBranch = status.current;
        const statusMessage = `--- ${chalk.green('➜')} ${chalk.cyanBright(currentDirectory)} ${chalk.blue('git:(')}${chalk.red(currentBranch)}${chalk.blue(')')} ---`;
        console.log(`\n${chalk.bold(statusMessage)}\n`);
    } catch (error) {
        console.error(chalk.redBright("Erreur : Ce répertoire n'est pas un répo Git !"));
        process.exit(1);
    }
}

async function getGitFiles() {
    const status = await git.status();
    return [
        ...status.modified.map(file => ({ name: ` ${chalk.yellow('🟡')} ${file}`, value: file })),
        ...status.not_added.map(file => ({ name: ` ${chalk.red('🔴')} ${file}`, value: file })),
        ...status.deleted.map(file => ({ name: ` ${chalk.blue('🗑️')} ${file}`, value: file })),
    ];
}

async function getRmFiles() {
    const trackedFiles = await git.raw(['ls-files']);
    const files = trackedFiles.trim().split('\n');

    return files.map(file => ({
        name: ` ${chalk.green('🟢')} ${file}`,
        value: file,
    }));
}

async function cleanIndex() {
    try {
        await git.reset(['HEAD']);
    } catch (error) {
        console.error("Erreur pendant la tentative de nettoyage :", error);
    }
}

async function undoLastCommit() {
    try {
        await git.reset(['--soft', 'HEAD~1']);
    } catch (error) {
        console.error("Erreur pendant l'annulation du dernier commit :", error);
    }
}

async function handleExit() {
    if (committed) {
        await undoLastCommit();
    }
    if (addedFiles && selectedFiles.length > 0) {
        await cleanIndex();
    }
    console.log(`\n${chalk.bold("Programme quitté avec succès.")}`);
    process.exit(0);
}

async function main() {
    await loadDependencies();

    const args = process.argv.slice(2);

    if (args.includes('-h') || args.includes('--help')) {
        await showHelp();
        return;
    }
    if (args.includes('-s') || args.includes('--stats')) {
        await showStats();
        return;
    }

    if (args.includes('-r') || args.includes('--remove')) {
        gitrm = true;
    }
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
        if (key.toString() === 'q') {
            await handleExit();
        }
    });

    try {
        await displayGitStatus();
        await createGitignore();

        let files;
        if (gitrm) {
            files = await getRmFiles();
        } else {
            files = await getGitFiles();
        }

        if (files.length === 0) {
            console.log(`${chalk.yellow("Aucun fichier modifié ou non suivi trouvé.")}`);
            process.exit(0);
        }

        selectedFiles = await selectFilesToAdd(files, gitrm);
        addedFiles = selectedFiles.length > 0;

        if (!addedFiles) {
            console.log(`${chalk.yellow("Aucun fichier sélectionné.")}`);
            process.exit(0);
        }

        if (gitrm) {
            await git.rm(selectedFiles);
        } else {
            await git.add(selectedFiles);
        }

        const commitType = await chooseCommitType();
        const commitMessage = await getCommitMessage(commitType, selectedFiles);
        committed = true;

        await git.commit(commitMessage);

        console.log(`\n--- ${chalk.greenBright("Commit effectué avec succès.")} ---\n`);
        console.log(`Message de commit : ${chalk.blue(`${commitMessage}`)}`);
        console.log(`Fichiers commit :\n${chalk.green(selectedFiles.join(' | '))}`);

        const shouldPush = await confirmPush();

        if (shouldPush) {
            await git.push();
            console.log(`${chalk.greenBright("Push effectué avec succès.")}`);
        } else {
            await handleExit();
        }
    } catch (err) {
        console.error("Erreur :", err);
        await handleExit();
    } finally {
        process.stdin.setRawMode(false);
    }
}

main();
