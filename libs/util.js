'use strict';

const moment = require('moment');
const R = require('ramda');
const fs = require('fs');

const { DateQueryError } = require('./errors');

/**
 * Parses the Request#query for 'from' and 'to' param and generates the range query for mongo
 * @param {object} query - The request query
 * @returns {object} - An object to be merged with the rest of the query object
 * @throws {DateQueryError} from and to must be valid dates
 */
function parseDateQuery(query) {
    let result = {};
    let from = query.from;
    let to = query.to;

    if (from) {
        from = moment(from, moment.ISO_8601);
        if (!from.isValid()) {
            throw new DateQueryError('from.invalid');
        }

        result = R.assocPath(['createdAt', '$gte'], from.startOf('day').toDate(), result);
    }

    if (to) {
        to = moment(to, moment.ISO_8601);

        if (!to.isValid()) {
            throw new DateQueryError('to.invalid');
        }

        result = R.assocPath(['createdAt', '$lt'], to.endOf('day').toDate(), result);
    }

    return result;
}

function forDir(path, loadTemplates, fn) {
    if (!fn) {
        fn = loadTemplates;
        loadTemplates = false;
    }

    const dir = fs.readdirSync(path);

    dir.forEach(function eachDirFn(file) {
        if (fs.lstatSync(path + '/' + file).isFile()) {
            if (!loadTemplates && file.indexOf('_template') > -1) {
                return;
            }

            return fn(path + '/' + file);
        }
        // End with function, for tail call
        // http://duartes.org/gustavo/blog/post/tail-calls-optimization-es6/
        // Recursive if its a directory
        return forDir(`${path}/${file}/`, loadTemplates, fn);
    });
}

/**
 * Check if the value is an int
 * @param value
 * @returns {boolean}
 * @private
 */
function isInt(value) {
    return value === parseInt(value, 10);
}

module.exports = {
    parseDateQuery,
    forDir,
    isInt
};
