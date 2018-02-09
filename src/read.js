import GoogleAuth from 'google-auth-library';
import goog from 'googleapis';
import { nfcall } from 'q';
import cellsToJson from './cellsToJson';
import { config } from 'dotenv';
import checkEnv from './checkEnv';
import errorHandler from './errorHandler';

const authenticateAsGoogleServiceAccount = async (email, key) => {
    const auth = new GoogleAuth();
    const jwtClient = new auth.JWT(
        email,
        null,
        key,
        ['https://www.googleapis.com/auth/spreadsheets'],
        null
    );
    await nfcall((...args) => jwtClient.authorize(...args));
    return jwtClient;
};

const main = async ({ log }) => {
    config();
    checkEnv([
        'GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL',
        'GOOGLE_SPREADSHEET_ID',
        'GOOGLE_SPREADSHEET_RANGES'
    ]);
    const {
        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_hex,
        GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        GOOGLE_SPREADSHEET_ID,
        GOOGLE_SPREADSHEET_RANGES
    } = process.env;

    const googlePK =
        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
        new Buffer(GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_hex, 'hex').toString(
            'utf8'
        );

    const authClient = await authenticateAsGoogleServiceAccount(
        GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        googlePK
    );

    const sheetsAPI = goog.sheets({
        version: 'v4',
        auth: authClient
    });

    let mergedData = [];
    const ranges = GOOGLE_SPREADSHEET_RANGES.split(',');

    for (var i = 0; i < ranges.length; i++) {
        const range = ranges[i];

        log(`Retrieving range ${range}`);
        const [rangeData] = await nfcall(sheetsAPI.spreadsheets.values.get, {
            range,
            spreadsheetId: GOOGLE_SPREADSHEET_ID
        });
        log(`Retrieved ${rangeData.values.length} rows`);

        const parsedData = cellsToJson(rangeData.values);
        mergedData = mergedData.concat(parsedData);
    }

    log(`${mergedData.length} records processed`);
    return mergedData;
};

if (!module.parent) {
    main({ log: console.warn.bind(console) }).then(
        res => console.log(JSON.stringify(res, false, 2)),
        errorHandler
    );
}

module.exports = main;
