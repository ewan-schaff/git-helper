#!/usr/bin/env node
const simpleGit = require('simple-git');
let inquirer;
let chalk;
const { selectFilesToAdd } = require('./src/add.js');
const { chooseCommitType, getCommitMessage } = require('./src/commit.js');
const { confirmPush } = require('./src/push.js');
const git = simpleGit();

let addedFiles = false;
let committed = false;
let selectedFiles = [];

async function loadDependencies() {
    chalk = (await import('chalk')).default;
    inquirer = (await import('inquirer')).default;
}

async function displayGitStatus() {
    const currentDirectory = process.cwd();
    const status = await git.status();
    const currentBranch = status.current;
    const statusMessage = `--- ${chalk.green('➜')} ${chalk.cyanBright(currentDirectory)} ${chalk.blue('git:(')}${chalk.red(currentBranch)}${chalk.blue(')')} ---`;
    console.log(`\n${chalk.bold(statusMessage)}\n`);
}

async function getGitFiles() {
    const status = await git.status();
    return [
        ...status.modified.map(file => ({ name: ` ${chalk.yellow('🟡')} ${file}`, value: file })),
        ...status.not_added.map(file => ({ name: ` ${chalk.red('🔴')} ${file}`, value: file }))
    ];
}

async function cleanIndex() {
    try {
        await git.reset(['HEAD']);
        console.log(`\n--- ${chalk.bold("Ajouts nettoyés")} ---`);
    } catch (error) {
        console.error("Erreur pendant la tentative de nettoyage :", error);
    }
}

async function undoLastCommit() {
    try {
        await git.reset(['--soft', 'HEAD~1']);
        await git.reset(['HEAD']);
        console.log(`\n--- ${chalk.bold("Dernier commit annulé, modifications conservées dans l'index")} ---`);
    } catch (error) {
        console.error("Erreur pendant l'annulation du dernier commit :", error);
    }
}

async function handleExit() {
    if (addedFiles && selectedFiles.length > 0) {
        console.log(`\n--- ${chalk.redBright("Nettoyage des fichiers ajoutés...")} ---`);
        await git.reset(['HEAD', ...selectedFiles]);
    } else if (committed) {
        await undoLastCommit();
    }
    console.log(`\n--- ${chalk.bold("Programme quitté avec succès")} ---\n`);
    process.exit(0);
}

async function main() {
    await loadDependencies();

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
        if (key.toString() === 'q') {
            await handleExit();
        }
    });

    try {
        await displayGitStatus();
        const files = await getGitFiles();

        if (files.length === 0) {
            console.log(`${chalk.yellow("Aucun fichier modifié ou non suivi trouvé.")}`);
            process.exit(0);
        }

        selectedFiles = await selectFilesToAdd(files);
        addedFiles = selectedFiles.length > 0;

        if (!addedFiles) {
            console.log(`${chalk.yellow("Aucun fichier sélectionné.")}`);
            process.exit(0);
        }

        await git.add(selectedFiles);
        const commitType = await chooseCommitType();
        const commitMessage = await getCommitMessage(commitType, selectedFiles);
        committed = true;

        await git.commit(commitMessage);

        console.log(`\n--- ${chalk.bold(`${chalk.greenBright("Commit effectué avec succès")}`)} ---`);
        console.log(`Message de commit : ${chalk.blue(`${commitMessage}`)}`);
        console.log(`Fichiers commit :\n${chalk.green(selectedFiles.join(' | '))}`);

        const shouldPush = await confirmPush();

        if (shouldPush) {
            await git.push();
            console.log(`\n--- ${chalk.bold("Push effectué avec succès")} ---`);
        } else {
            await undoLastCommit();
        }
    } catch (err) {
        console.error("Erreur :", err);
    } finally {
        process.stdin.setRawMode(false);
    }
}

main();
