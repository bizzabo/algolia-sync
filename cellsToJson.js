import { zipObject } from 'lodash';
import { camel } from 'case';
import { expect } from 'chai';

const isNotEmptyRow = ({ values }) =>
    Object.keys(values).some(i => values[i] !== undefined && values[i].length);

const sanitizeFieldName = fieldName =>
    fieldName === undefined ? undefined : camel(fieldName.trim());

const convertToObject = fieldNames => row => zipObject(fieldNames, row);

const extractTags = fieldNames => {
    const tagsStartIndex = fieldNames.indexOf('tags');
    return row => [
        ...row.slice(0, tagsStartIndex),
        row.slice(tagsStartIndex).map(tag => tag.trim())
    ];
};

const addLineNumber = (row, i) => {
    return { values: row, lineNumber: i + 2 };
};
const validateFieldNames = fieldNames => {
    expect(fieldNames).to.be.an('array');
    const message =
        'first line of should contain "pageUrl", "category", "pageName", "eventLevel", "internal", "icon" and "tags"';
    expect(fieldNames, message).to.include('tags');
    expect(fieldNames, message).to.include('pageUrl');
    expect(fieldNames, message).to.include('category');
    expect(fieldNames, message).to.include('pageName');
    expect(fieldNames, message).to.include('internal');
    expect(fieldNames, message).to.include('eventLevel');
    expect(fieldNames, message).to.include('icon');
};

const validate = ({ lineNumber, values }) => {
    const { pageUrl, pageName, eventLevel } = values;
    try {
        expect(pageUrl, '"pageUrl" must be set').not.to.be.empty;
        expect(
            pageUrl.startsWith('/') ||
                pageUrl.startsWith('http://') ||
                pageUrl.startsWith('https://'),
            '"pageUrl" must start with "/", "http://" || "https://"'
        ).to.be.ok;
        expect(
            eventLevel === 'true' || eventLevel === 'false',
            '"eventLevel" should be either "true" or "false"'
        );
        expect(pageName, '"pageName" must be set').not.to.be.empty;

        return { lineNumber, values };
    } catch (e) {
        e.message = `Error at line ${lineNumber}, data: ${JSON.stringify(
            values
        )}\n${e.message}`;
        throw e;
    }
};

const normalize = ({ values }) => {
    const { eventLevel, internal } = values;
    return {
        ...values,
        eventLevel: eventLevel.includes('true'),
        internal: internal.includes('true')
    };
};

export default rows => {
    const fieldNames = rows[0].map(sanitizeFieldName);
    validateFieldNames(fieldNames);
    const dataRows = rows.slice(1);
    return dataRows
        .map(extractTags(fieldNames))
        .map(convertToObject(fieldNames))
        .map(addLineNumber)
        .filter(isNotEmptyRow)
        .map(validate)
        .map(normalize);
};
