module.exports = {
    getMiddlewareLogger,
    createErrorLogger,
    getLogger
};

const winston = require('winston');
const expressWinston = require('express-winston');
const moment = require('moment');
const _ = require('lodash');

function getMiddlewareLogger(config) {
    expressWinston.requestWhitelist = _.remove(expressWinston.requestWhitelist, el => el !== 'originalUrl');
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');

    const env = process.env.NODE_ENV || 'development';
    const format = getFormat(config, env);
    const transports = getTransports(config, env);

    return expressWinston.logger({
        transports,
        statusLevels: true,
        level: config.get('logger.level'),
        requestFilter: filterReqData,
        format
    });
}

function createErrorLogger(config) {
    const env = process.env.NODE_ENV || 'development';
    const format = getFormat(config, env);
    const transports = getTransports(config, env);

    return expressWinston.errorLogger({
        transports,
        statusLevels: true,
        level: config.get('logger.level'),
        // requestFilter: filterReqData,
        format
    });
}

function getLogger(config) {
    const env = process.env.NODE_ENV || 'development';
    const format = getFormat(config, env);
    const transports = getTransports(config, env);
    return winston.createLogger({
        transports,
        statusLevels: true,
        level: config.get('logger.level'),
        requestFilter: filterReqData,
        format
    });
}

function setLogSrc(config, env) {
    return winston.format((data, opts) => { // eslint-disable-line no-unused-vars
        data.logsrc = config.get('logger.tag');
        data.env = env;
        data.date = moment();
        return data;
    });
}

function filterReqData(req, propName) {
    if (propName === 'headers') {
        const redacted = '***';
        let attrs = _.keys(req[propName]);
        attrs = _.remove(attrs, el => el !== 'accept-encoding');
        // console.log('-- attrs: ', attrs);
        return _
            .chain(req)
            .get(propName)
            .cloneDeep()
            .assign(_.pick({
                authorization: redacted,
                cookie: redacted,
            }, _.keys(req[propName])))
            .pick(req[propName], attrs)
            .value();
    }
    return req[propName];
}

function getFormat(config, env) {
    const addLogSrc = setLogSrc(config, env);

    if (env === 'development')  {
        return winston.format.combine(
            addLogSrc(),
            winston.format.colorize(),
            winston.format.simple()
        );
    }

    return winston.format.combine(
        addLogSrc(),
        winston.format.colorize(),
        winston.format.json()
    );
}

function getTransports(config, env) {
    if (env === 'development') {
        return [
            new winston.transports.Console()
        ];
    }

    const path = config.get('logger.path');
    const fileName = config.get('logger.fileName');
    const errFileName = config.get('logger.errFileName');

    return [
        new winston.transports.Console(),
        new winston.transports.File({
            name: 'info-file',
            filename: `${path}/${fileName}`,
            level: 'info'
        }),
        new winston.transports.File({
            name: 'error-file',
            filename: `${path}/${errFileName}`,
            handleExceptions: true,
            humanReadableUnhandledException: true,
            level: 'error'
        })
    ];
}
