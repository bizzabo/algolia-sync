import { expect } from 'chai';

export default envNames => {
    envNames.forEach(envName => {
        expect(
            process.env[envName],
            `You need to create a .env file with ${envName} set. For reference, take a look at sample.env`
        ).not.to.be.empty;
    });
};
