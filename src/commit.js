const fs = require('fs');
const path = require('path');

function formatFileNames(fileNames) {
    return fileNames
        .map((file) => {
            const fileName = file.split('/').pop();
            return fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
        })
        .join('&&');
}

async function loadCommitHistory() {
    const historyFilePath = path.join(process.cwd(), '.history');
    if (fs.existsSync(historyFilePath)) {
        const history = fs.readFileSync(historyFilePath, 'utf-8')
            .split('\n')
            .filter(Boolean)
        return history;
    }
    return [];
}

async function saveCommitMessage(commitMessage) {
    const historyFilePath = path.join(process.cwd(), '.history');
    try {
        let existingHistory = fs.existsSync(historyFilePath)
            ? fs.readFileSync(historyFilePath, 'utf-8').split('\n').filter(Boolean)
            : [];

        if (!existingHistory.includes(commitMessage)) {
            existingHistory = [commitMessage, ...existingHistory];
        }

        fs.writeFileSync(historyFilePath, existingHistory.join('\n'), 'utf-8');
    } catch (err) {
        console.error('Erreur lors de l\'écriture de l\'historique des commits :', err);
    }
}


async function chooseCommitType() {
    const { commitType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'commitType',
            message: 'Choisissez le type de commit :',
            choices: [
                { name: 'feat: Une nouvelle fonctionnalité', value: 'feat' },
                { name: 'fix: Une correction de bug', value: 'fix' },
                { name: 'docs: Mise à jour de la documentation', value: 'docs' },
                { name: 'style: Changement de style (espaces, formatage)', value: 'style' },
                { name: 'refactor: Refactorisation du code', value: 'refactor' },
                { name: 'perf: Amélioration des performances', value: 'perf' },
                { name: 'test: Ajout ou modification de tests', value: 'test' },
                { name: 'chore: Autres tâches (ex. build)', value: 'chore' },
                { name: 'remove: Retire un ou plusieurs fichiers', value: 'remove' },
                { name: 'codding-style: Changement d\'erreur codding style', value: "codding-style"},
                { name: 'merge: Corrige un merge', value: "merge"},
            ],
            prefix: '',
        }
    ]);
    return commitType;
}

async function getCommitMessage(commitType, fileNames) {
    const formattedFiles = formatFileNames(fileNames);

    let commitHistory = await loadCommitHistory();

    let currentIndex = -1;
    let commitMessage = '';

    while (true) {
        process.stdout.write(`\r${' '.repeat(process.stdout.columns)}\r`);
        process.stdout.write(`${chalk.green('✔')} ${chalk.bold(`Entrez votre message de commit pour le type "${commitType}" : ${commitMessage || ''}`)}`);
        const key = await readKeyPress();

        if (key === 'up' && currentIndex < commitHistory.length - 1) {
            currentIndex++;
            commitMessage = commitHistory[currentIndex];
        } else if (key === 'down' && currentIndex > -1) {
            currentIndex--;
            commitMessage = currentIndex === -1 ? '' : commitHistory[currentIndex];
        } else if (key === 'enter') {
            if (!commitMessage.trim()) {
                continue;
            }
            break;
        } else if (key === 'backspace') {
            commitMessage = commitMessage.slice(0, -1);
            currentIndex = -1;
        } else if (key.length === 1) {
            commitMessage += key;
            currentIndex = -1;
        }
    }

    await saveCommitMessage(commitMessage);

    return `${commitType}(${formattedFiles}): ${commitMessage}`;
}


function readKeyPress() {
    return new Promise((resolve) => {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', (key) => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            const keyCode = key.toString();
            if (keyCode === '\u001b[A') resolve('up');
            if (keyCode === '\u001b[B') resolve('down');
            if (keyCode === '\r') resolve('enter');
            if (keyCode === '\u0008' || keyCode === '\u007f') resolve('backspace');
            resolve(key);
        });
    });
}

module.exports = { getCommitMessage, chooseCommitType, formatFileNames };
