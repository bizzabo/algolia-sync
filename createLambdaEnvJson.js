const fs = require('q-io/fs');
const { config } = require('dotenv');
const { pick } = require('lodash');
const { join } = require('path');
const checkEnv = require('./dist/checkEnv').default;

const encode = envs => ({
    ...envs,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: null,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_hex: new Buffer(
        envs.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        'utf8'
    ).toString('hex')
});

const main = () => {
    config();
    const envNames = [
        'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
        'GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL',
        'GOOGLE_SPREADSHEET_ID',
        'GOOGLE_SPREADSHEET_RANGES',
        'ALGOLIA_INDEX_NAME',
        'ALGOLIA_APP_ID',
        'ALGOLIA_WRITE_KEY'
    ];

    checkEnv(envNames);

    const envs = encode(pick(process.env, envNames));
    console.log(envs);
    fs.write(
        join(__dirname, '.env-lambda.json'),
        JSON.stringify(envs, false, 2)
    );
};

main();
