const simpleGit = require('simple-git');
const git = simpleGit();

async function loadChalk() {
    const chalk = (await import('chalk')).default;
    return chalk;
}

async function showStats() {
    const chalk = await loadChalk();

    try {
        const lastPushedCommit = await git.raw(['log', '-1', '--format=%cd', 'origin/main']);
        const lastPushedDate = lastPushedCommit.trim();

        const branches = await git.branchLocal();
        const branchCount = branches.all.length;
        const pushedCommits = await git.raw(['log', '--oneline', 'origin/main']);
        const pushedCount = pushedCommits.split('\n').filter(commit => commit).length;

        console.log(`\n--- ${chalk.bold("Statistiques du dépôt")} ---\n`);
        console.log(`Nombre de commits : ${chalk.green(pushedCount)}`);
        console.log(`Date du dernier commit : ${chalk.green(lastPushedDate)}`);
        console.log(`Nombre de branches : ${chalk.green(branchCount)}`);
        console.log("\n")
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error);
    }
}

module.exports = { showStats };
