const fs = require('fs');
const path = require('path');

function formatFileNames(fileNames) {
    return fileNames.map((file) => file.replace(/[^a-zA-Z0-9.\-_]/g, '')).join('&&');
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

        // Ajouter le nouveau message au début s'il n'est pas déjà présent
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
            ],
            prefix: '',
        }
    ]);
    return commitType;
}

async function getCommitMessage(commitType, fileNames) {
    const formattedFiles = formatFileNames(fileNames);

    // Charger l'historique des commits
    let commitHistory = await loadCommitHistory();

    let currentIndex = -1; // Index pour naviguer dans l’historique
    let commitMessage = ''; // Message par défaut

    while (true) {
        process.stdout.write(`\r${' '.repeat(process.stdout.columns)}\r`); // Nettoyer la ligne actuelle
        process.stdout.write(`${chalk.green('✔')} ${chalk.bold(`Entrez votre message de commit pour le type "${commitType}" : ${commitMessage || ''}`)}`);
        const key = await readKeyPress();

        if (key === 'up' && currentIndex < commitHistory.length - 1) {
            // Naviguer vers un message plus ancien
            currentIndex++;
            commitMessage = commitHistory[currentIndex];
        } else if (key === 'down' && currentIndex > -1) {
            // Naviguer vers un message plus récent ou une saisie libre
            currentIndex--;
            commitMessage = currentIndex === -1 ? '' : commitHistory[currentIndex];
        } else if (key === 'enter') {
            // Valider le message
            if (!commitMessage.trim()) {
                continue;
            }
            break;
        } else if (key === 'backspace') {
            // Supprimer un caractère si l'utilisateur écrit
            commitMessage = commitMessage.slice(0, -1);
            currentIndex = -1; // Sortir de l’historique
        } else if (key.length === 1) {
            // Ajouter un caractère si l'utilisateur écrit
            commitMessage += key;
            currentIndex = -1; // Sortir de l’historique
        }
    }

    // Sauvegarder le message dans l’historique
    await saveCommitMessage(commitMessage);

    return `${commitType}(${formattedFiles}): ${commitMessage}`;
}


// Fonction utilitaire pour gérer les touches
function readKeyPress() {
    return new Promise((resolve) => {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', (key) => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            const keyCode = key.toString();
            if (keyCode === '\u001b[A') resolve('up'); // Flèche haut
            if (keyCode === '\u001b[B') resolve('down'); // Flèche bas
            if (keyCode === '\r') resolve('enter'); // Entrée
            if (keyCode === '\u0008' || keyCode === '\u007f') resolve('backspace'); // Retour arrière
            resolve(key); // Autres touches
        });
    });
}

module.exports = { getCommitMessage, chooseCommitType, formatFileNames };
