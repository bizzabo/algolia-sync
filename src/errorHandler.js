import chalk from 'chalk';

export default e => {
    console.error(chalk.white.bgRed.bold(e.message));
    console.error(chalk.yellow(e.stack));
};
