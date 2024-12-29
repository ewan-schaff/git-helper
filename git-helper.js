#!/usr/bin/env node
const simpleGit = require('simple-git');

let inquirer;
let chalk;
const { showHelp } = require('./src/helper.js');
const { showStats } = require('./src/stats.js')
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
        ...status.not_added.map(file => ({ name: ` ${chalk.red('🔴')} ${file}`, value: file })),
        ...status.deleted.map(file => ({ name: ` ${chalk.blue('🗑️')} ${file}`, value: file })) // Ajoute les fichiers supprimés
    ];
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
        await git.reset(['--soft', 'HEAD~1']); // Garder les modifications dans l'index
    } catch (error) {
        console.error("Erreur pendant l'annulation du dernier commit :", error);
    }
}

async function handleExit() {
    if (committed) {
        await undoLastCommit(); // Annuler le dernier commit
    }
    if (addedFiles && selectedFiles.length > 0) {
        await cleanIndex(); // Nettoyer les fichiers ajoutés
    }
    console.log(`${chalk.bold("Programme quitté avec succès.")}`);
    process.exit(0);
}

async function main() {
    await loadDependencies();

    // Vérifier les arguments passés
    const args = process.argv.slice(2);

    // Vérifier si l'option -h ou --help est utilisée
    if (args.includes('-h') || args.includes('--help')) {
        await showHelp();
        return;
    }

    // Vérifier si l'option -s ou --stats est utilisée
    if (args.includes('-s') || args.includes('--stats')) {
        await showStats();
        return;
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
