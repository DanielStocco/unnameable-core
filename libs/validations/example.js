const validator = require('./validator');

const exampleConstrains = {
    to: {
        presence: { message: 'to_required' },
    },
    'to.firstName': {
        format: {
            pattern: /([a-zA-ZñÑáéíóúüÁÉÍÓÚÜçÇ ]{2,30})/,
            message: 'invalid_first_name'
        }
    },
    'to.lastName': {
        format: {
            pattern: /([a-zA-ZñÑáéíóúüÁÉÍÓÚÜçÇ ]{2,30})/,
            message: 'invalid_last_name'
        }
    },
    'to.email': {
        email: { message: 'invalid_email' }
    },
    amount: {
        presence: { message: 'amount_required' },
        numericality: {
            onlyInteger: true,
            message: 'invalid_amount'
        }
    },
    currency: {
        presence: { message: 'currency_required' },
        inclusion: {
            within: ['ARS', 'USD'],
            message: 'invalid_currency'
        }
    }
};

const validate = ({ data, likeArray }) => validator({
    object: data,
    constrains: exampleConstrains,
    likeArray
});

module.exports = {
    validate
};
