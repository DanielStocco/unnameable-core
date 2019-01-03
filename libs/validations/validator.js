'use strict';

const validate = require('validate.js');
const _ = require('lodash');
const moment = require('moment');

// Before using it we must add the parse and format functions
validate.extend(validate.validators.datetime, {
    // The value is guaranteed not to be null or undefined but otherwise it
    // could be anything.
    parse: function (value) {
        return +moment.utc(value);
    },
    // Input is a unix timestamp
    format: function (value, options) {
        const format = options.dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD hh:mm:ss';
        return moment.utc(value).format(format);
    }
});


validate.formatters.custom = (errors) => {
    return errors
        .filter((error) => {
            if (!error.options.message) {
                return false;
            }
            return true;
        })
        .map((error) => error.options.message);
};

/**
 * change way to validate.js library returns errors.
 * @param constrains
 * @param object
 * @param likeArray
 * @returns {*}
 */
const validator = ({constrains, object, likeArray}) => {
    const errors = validate(object, constrains, {format: 'custom'});
    if (!errors) {
        return;
    }
    if (likeArray) {
        return errors;
    }
    return _.join(errors, ', ');
};
module.exports = validator;
