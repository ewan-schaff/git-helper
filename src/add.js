async function loadDependencies() {
    chalk = (await import('chalk')).default;
    inquirer = (await import('inquirer')).default;
}

async function selectFilesToAdd(files) {
    await loadDependencies()
    const { selectedFiles } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedFiles',
            message: 'Sélectionnez les fichiers que vous souhaitez ajouter :',
            choices: files,
            loop: false,
            pageSize: 10,
        }
    ]);
    addedFiles = selectedFiles.length > 0;
    return selectedFiles;
}

module.exports = { selectFilesToAdd };