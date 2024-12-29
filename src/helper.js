let chalk;

async function loadChalk() {
    chalk = (await import('chalk')).default;
}

async function showHelp() {
    await loadChalk();

    console.log(`
        ${chalk.bold("Utilisation :")}
            ./git-helper [options]

        ${chalk.bold("Options :")}
            -h, --help        Afficher ce message d'aide et quitter
            -v, --version     Afficher la version du script

        ${chalk.bold("Fonctionnalités :")}
            Ce script vous permet de sélectionner des nouveaux fichiers ou des fichiers modifiés et de les ajouter à un commit Git de manière interactive.

            1. Lors du lancement sans option, le script affiche les nouveaux fichiers ou les fichiers modifiés.
            2. Utilisez les flèches pour naviguer dans les fichiers, et appuyez sur [espace] pour sélectionner des fichiers.
            3. Une fois vos fichiers sélectionnés, choisissez le type de commit et entrez un message pour compléter l'opération.

        ${chalk.bold("Touches utilisables :")}
            - ${chalk.bold("[↑] / [↓]")} : Naviguer dans la liste des fichiers
            - ${chalk.bold("[Espace]")} : Sélectionner/désélectionner un fichier
            - ${chalk.bold("[a]")} : Sélectionner tous les fichiers
            - ${chalk.bold("[i]")} : Inverser la sélection
            - ${chalk.bold("[q]")} : Quitter le programme et annuler toutes les actions en cours
            - ${chalk.bold("[Ctrl+C]")} : Annuler et quitter

        ${chalk.bold("Exemple :")}
            ./git-helper            Lance l'interface interactive pour ajouter et committer des fichiers.
            ./git-helper --help     Affiche ce message d'aide.
    `);
    process.exit(0);
}

module.exports = { showHelp };
