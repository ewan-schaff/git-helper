async function loadChalk() {
    chalk = (await import('chalk')).default;
}

async function showVersion() {
    await loadChalk();

    console.log(`git-helper, version ${chalk.bold(`1.3.0`)}`);
    process.exit(0);
}

module.exports = { showVersion };
