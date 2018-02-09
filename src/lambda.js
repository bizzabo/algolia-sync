require('babel-polyfill');
const ApiBuilder = require('claudia-api-builder');
const api = new ApiBuilder();
const read = require('./read');
const write = require('./write');

api.post('/algolia-sync-slack-command', async req => {
    const logs = [];
    const log = (...args) => {
        logs.push(args.join(' '));
    };

    const records = await read({ log });
    await write({ input: records, log });

    return { text: logs.join('\n') };
});

module.exports = api;
