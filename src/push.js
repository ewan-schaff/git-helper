async function confirmPush() {
    const { shouldPush } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'shouldPush',
            message: 'Le commit a été effectué avec succès. Voulez-vous le pousser ?',
            default: true,
        }
    ]);
    return shouldPush;
}

module.exports = { confirmPush };
