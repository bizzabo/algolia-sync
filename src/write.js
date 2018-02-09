import { config } from 'dotenv';
import algoliasearch from 'algoliasearch';
import checkEnv from './checkEnv';
import errorHandler from './errorHandler';
import getStdin from 'get-stdin';
import chalk from 'chalk';

const algoliaDefaultRanking = [
    'typo',
    'geo',
    'words',
    'filters',
    'proximity',
    'attribute',
    'exact',
    'custom'
];

const main = async ({ input, log }) => {
    config();
    checkEnv(['ALGOLIA_INDEX_NAME', 'ALGOLIA_APP_ID', 'ALGOLIA_WRITE_KEY']);

    const {
        ALGOLIA_INDEX_NAME,
        ALGOLIA_APP_ID,
        ALGOLIA_WRITE_KEY
    } = process.env;
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_KEY);

    const index = client.initIndex(ALGOLIA_INDEX_NAME);

    log(`Clearing the existing index ${ALGOLIA_INDEX_NAME}`);
    await index.clearIndex();

    log(`Updating index settings`);
    await index.setSettings({
        hitsPerPage: 200,
        searchableAttributes: ['pageName', 'tags'],
        attributesForFaceting: [
            'searchable(tags)',
            'searchable(category)',
            'searchable(eventLevel)'
        ],
        ranking: [
            'desc(internal)', //show application-level items first, then go FAQs, videos, etc
            'asc(priority)', //order by priority
            ...algoliaDefaultRanking
        ]
    });

    log(`Adding ${input.length} objects to index ${ALGOLIA_INDEX_NAME}`);
    await index.addObjects(input);

    log(
        chalk.white.bgGreen.bold(
            'Congratulations! Your index has been synchronized successfully'
        )
    );
};

if (!module.parent) {
    getStdin().then(inputData => {
        return main({
            input: JSON.parse(inputData),
            log: console.warn.bind(console)
        }).then(
            res => console.log(JSON.stringify(res, false, 2)),
            errorHandler
        );
    });
}

module.exports = main;
