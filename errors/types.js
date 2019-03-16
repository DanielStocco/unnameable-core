const _ = require('lodash');

class BaseError extends Error {
    constructor(err, params) {
        super(err.msg);
        this.status = err.status;
        this.code = err.code;
        this.msg = err.msg;
        this.params = params;
        this.type = _.snakeCase(this.constructor.name); // converts BaseError to base_error
    }

    toObject() {
        const data = {
            code: this.code || -1,
            type: this.type,
            msg: this.msg
        };

        if (this.params !== 'undefined' || this.params !== null) {
            data.meta = {};
            // Merges extra params into error object
            Object.assign(data.meta, this.params);

        }
        return data;
    }
}

class AuthError extends BaseError {
    constructor(code, params) {
        const errors = {
            UNKNOWN: { status: 401, code: 1, msg: 'permission_denied' },
            PERM_DENIED: { status: 401, code: 2, msg: 'permission_denied' },
            APIKEY_INVALID: { status: 401, code: 3, msg: 'invalid_apikey' },
            APIKEY_NOT_FOUND: { status: 401, code: 4, msg: 'apikey_not_found' },
            APIKEY_NOT_MATCH: { status: 401, code: 5, msg: 'permission_denied' },
            BIZ_INVALID: { status: 401, code: 6, msg: 'permission_denied' },
            BIZ_NOT_FOUND: { status: 401, code: 7, msg: 'permission_denied' },
            INTERNAL_APIKEY_NOT_FOUND: { status: 401, code: 8, msg: 'internal_apikey_not_found' },
            ACCESS_FORBIDDEN: { status: 403, code: 9, msg: 'access_forbidden' },
        };
        let err = errors[code] || errors.PERM_DENIED;
        super(err, params);
    }
}

class ApiError extends BaseError {
    constructor(code, params) {
        const errors = {
            BAD_REQUEST: { status: 400, code: 10, msg: 'bad_request' },
            ROUTE_NOT_FOUND: { status: 404, code: 11, msg: 'route_not_found' },
            CONTENT_TYPE_INVALID: { status: 406, code: 12, msg: 'unsupported_content_type' },
            METHOD_NOT_ALLOWED: { status: 405, code: 13, msg: 'method_not_allowed' }
        };
        let err = errors[code] || errors.BAD_REQUEST;
        super(err, params);
    }
}

class ServiceError extends BaseError {
    constructor(code, params) {
        const errors = {
            INTERNAL_ERROR: { status: 500, code: 120, msg: 'external_service_internal_error' },
            CREATE_USER_ERROR: { status: 502, code: 120, msg: 'external_service_create_user_error' },
            TIMEOUT: { status: 504, code: 121, msg: 'external_service_timeout' },
        };
        let err = errors[code] || errors.INTERNAL_ERROR;
        super(err, params);
    }
}

class ServerError extends BaseError {
    constructor(code, params) {
        const errors = {
            INTERNAL_ERROR: { status: 500, code: 100, msg: 'internal_server_error' },
        };
        let err = errors[code] || errors.INTERNAL_ERROR;
        super(err, params);
    }
}

class ValidationError extends BaseError {
    constructor(code, fields, params) {
        const errors = {
            INVALID_FIELDS: { status: 400, code: 50, msg: fields }
        };
        let err = errors[code];
        super(err, params);
    }
}

class UserError extends BaseError {
    constructor(code, params) {
        const errors = {
            EMAIL_ALREADY_USED: { status: 400, code: 70, msg: 'email_already_used' },
            INTERNAL_SERVER_ERROR: { status: 500, code: 71, msg: 'internal_user_error' }
        };
        let err = errors[code];
        super(err, params);
    }
}


module.exports = {
    AuthError,
    ApiError,
    ServiceError,
    ServerError,
    ValidationError,
    UserError,
    BaseError
};
