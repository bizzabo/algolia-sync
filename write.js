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

const main = async () => {
    config();
    checkEnv(['ALGOLIA_INDEX_NAME', 'ALGOLIA_APP_ID', 'ALGOLIA_WRITE_KEY']);

    const {
        ALGOLIA_INDEX_NAME,
        ALGOLIA_APP_ID,
        ALGOLIA_WRITE_KEY
    } = process.env;
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_KEY);

    const inputData = JSON.parse(await getStdin());

    const index = client.initIndex(ALGOLIA_INDEX_NAME);

    console.warn(`Clearing the existing index ${ALGOLIA_INDEX_NAME}`);
    await index.clearIndex();

    console.warn(`Updating index settings`);
    await index.setSettings({
        searchableAttributes: ['pageName', 'tags'],
        attributesForFaceting: [
            'searchable(tags)',
            'searchable(category)',
            'searchable(eventLevel)'
        ],
        ranking: [
            'desc(internal)', //show application-level items first, then go FAQs, videos, etc
            ...algoliaDefaultRanking
        ]
    });

    console.warn(
        `Adding ${inputData.length} objects to index ${ALGOLIA_INDEX_NAME}`
    );
    await index.addObjects(inputData);

    console.warn(
        chalk.white.bgGreen.bold(
            'Congratulations! Your index has been synchronized successfully'
        )
    );
};

main().catch(errorHandler);
