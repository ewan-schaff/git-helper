let chalk;

async function loadChalk() {
    chalk = (await import('chalk')).default;
}

async function showHelp() {
    await loadChalk();

    console.log(`
        ${chalk.bold("Usage:")}
            ./git-helper [options]

        ${chalk.bold("Options:")}
            -h, --help        Display this help message and exit
            -s, --stats       Show repository statistics (e.g., number of commits, branches, etc.)
            -r, --remove      Enable interactive logic for performing 'git rm'

        ${chalk.bold("Features:")}
            This script allows you to interactively select new or modified files to stage and commit in Git.

            1. When launched without options, the script shows modified or untracked files.
            2. Use arrow keys to navigate the files and press [space] to select files.
            3. After selecting files, choose a commit type and enter a message to complete the operation.
            4. Navigate commit message history with [↑]/[↓] during message entry.
            5. Confirm whether to push the commit to the remote repository or not. If confirmed, the script will automatically push your changes.

        ${chalk.bold("Interactive Controls:")}
            - ${chalk.bold("[↑] / [↓]")} : Navigate through the list of files or commit history
            - ${chalk.bold("[Space]")} : Select/Deselect a file
            - ${chalk.bold("[a]")} : Select all files
            - ${chalk.bold("[i]")} : Invert the current selection
            - ${chalk.bold("[q]")} : Quit the program and cancel all ongoing actions
            - ${chalk.bold("[Ctrl+C]")} : Cancel and exit immediately

        ${chalk.bold("Example:")}
            ./git-helper            Launch the interactive interface to stage and commit files.
            ./git-helper --help     Display this help message.

        ${chalk.bold("Commit History:")}
            During commit message entry, you can navigate through previous commit messages using [↑] and [↓].
            This allows you to reuse commit messages from the history file (.history) saved in your repository's root directory.
    `);
    process.exit(0);
}

module.exports = { showHelp };
