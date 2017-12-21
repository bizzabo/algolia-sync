import _ from 'lodash';

export default rows => {
    const fieldNames = rows[0];
    console.log({ fieldNames });
    const dataRows = rows.slice(1);
    return _(dataRows)
        .map(row => _.zipObject(fieldNames, row))
        .value();
};
