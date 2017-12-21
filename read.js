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

const main = async () => {
    config();
    checkEnv([
        'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
        'GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL',
        'GOOGLE_SPREADSHEET_ID',
        'GOOGLE_SPREADSHEET_RANGES'
    ]);
    const {
        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        GOOGLE_SPREADSHEET_ID,
        GOOGLE_SPREADSHEET_RANGES
    } = process.env;

    const authClient = await authenticateAsGoogleServiceAccount(
        GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    );

    const sheetsAPI = goog.sheets({
        version: 'v4',
        auth: authClient
    });

    let mergedData = [];
    const ranges = GOOGLE_SPREADSHEET_RANGES.split(',');

    for (var i = 0; i < ranges.length; i++) {
        const range = ranges[i];

        console.warn(`Retrieving range ${range}`);
        const [rangeData] = await nfcall(sheetsAPI.spreadsheets.values.get, {
            range,
            spreadsheetId: GOOGLE_SPREADSHEET_ID
        });
        console.warn(`Retrieved ${rangeData.values.length} rows`);

        const parsedData = cellsToJson(rangeData.values);
        mergedData = mergedData.concat(parsedData);
    }

    console.log(JSON.stringify(mergedData, false, 2));
    console.warn(`${mergedData.length} records processed`);
};

main().catch(errorHandler);
