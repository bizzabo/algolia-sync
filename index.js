import GoogleAuth from 'google-auth-library';
import goog from 'googleapis';
import { nfcall } from 'q';
import cellsToJson from './cellsToJson';

import JWT_FILE from './Spreadsheet to Algolia-50ef84ccbba8.json';
const SHEET_ID = '1kbldcLdvljR-Bi8mynecmOTolV53GhFhB6HzSA88PUE';

const authenticateAsGoogleServiceAccount = async () => {
    const auth = new GoogleAuth();
    const jwtClient = new auth.JWT(
        JWT_FILE.client_email,
        null,
        JWT_FILE.private_key,
        ['https://www.googleapis.com/auth/spreadsheets'],
        null
    );
    await nfcall((...args) => jwtClient.authorize(...args));
    return jwtClient;
};

const main = async () => {
    const authClient = await authenticateAsGoogleServiceAccount();

    const sheets = goog.sheets({
        version: 'v4',
        auth: authClient
    });

    const [range] = await nfcall(sheets.spreadsheets.values.get, {
        range: 'A:AF',
        spreadsheetId: SHEET_ID
    });

    // console.log(range);
    const data = cellsToJson(range.values);
    console.log(data);
};

main();
