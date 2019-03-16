#!/usr/bin/env node

/**
 * Module dependencies.
 */
const http = require('http');
const express = require('express');
const { getMiddlewareLogger, getLogger } = require('./libs/logger');
const { setupRoutes } = require('./libs/router');
const cors = require('cors');
const { BaseError, ApiError, ServerError } = require('./errors/types');


let logger;
let _server;
let config;
let app;


function initialize(_config, routes) {
    config = _config;
    app = express();

    // This is to avoid logging every AWS request to /status.
    // @@TODO get status url from config.
    app.use((req, res, next) => {
        if (req.method === 'GET' && req.path === '/status') {
            return res.status(200).end();
        }
        return next();
    });


    // logger initialization
    const middlewareLogger = getMiddlewareLogger(config);
    app.use(middlewareLogger);
    logger = getLogger(config);

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Security settings
// See https://github.com/helmetjs/helmet for more information
    const helmet = require('helmet');
    app.use(helmet.frameguard('deny'));
    app.use(helmet.hidePoweredBy());
    app.use(helmet.xssFilter());
    app.use(helmet.ieNoOpen());

// Validate the request content type
    const typeIs = require('type-is'); // Infer the content-type of a request.
    app.use(function validRequestTypesMiddleware(req, res, next) {
        const validRequestTypes = ['json', 'multipart'];
        if (req.method === 'POST' && !typeIs(req, validRequestTypes)) {
            return next(new ApiError('CONTENT_TYPE_INVALID'));
        }
        next();
    });

    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(
        cors({
            origin: '*',
            allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
            exposeHeaders: ['X-Request-Id']
        }));

    // Set up response helpers.
    app.use(require('./libs/responses'));

    setupRoutes(app, routes);

    // Error handler
    app.use(_genericErrorHandler);

    return { app, logger };
}

function run() {
    /**
     * Get port from environment and store in Express.
     */
    const port = _normalizePort(config.get('port') || '3000');

    /**
     * Create HTTP server.
     */
    _server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */
    _server.listen(port);
    _server.on('error', _onError);
    _server.on('listening', _onListening);
}

/**
 * Normalize a port into a number, string, or false.
 */
function _normalizePort(val) {
    const _port = parseInt(val, 10);

    if (isNaN(_port)) {
        // named pipe
        return val;
    }

    if (_port >= 0) {
        // port number
        return _port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function _onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function _onListening() {
    const addr = _server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    logger.info('Listening on ' + bind);
}

// @@TODO Cconsiderar mover al directorio libs.
function _genericErrorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    logger.error(err);
    if (err instanceof BaseError) {
        return res.status(err.status).json(err.toObject());
    }
    return res.status(500).json((new ServerError('INTERNAL_ERROR')).toObject());
}

module.exports = {
    initialize,
    run,
    logger
};
