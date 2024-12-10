function formatFileNames(fileNames) {
    return fileNames.map((file) => file.replace(/[^a-zA-Z0-9.\-_]/g, '')).join('&&');
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
            ],
            prefix: '',
        }
    ]);
    return commitType;
}

async function getCommitMessage(commitType, fileNames) {
    const formattedFiles = formatFileNames(fileNames);
    const { commitMessage } = await inquirer.prompt([
        {
            type: 'input',
            name: 'commitMessage',
            message: `Entrez votre message de commit pour le type "${commitType}" :`,
            validate: (input) => input.trim() ? true : "Le message de commit ne peut pas être vide."
        }
    ]);
    committed = true;
    return `${commitType}(${formattedFiles}) ${commitMessage}`;
}

module.exports = { getCommitMessage, chooseCommitType, formatFileNames };
