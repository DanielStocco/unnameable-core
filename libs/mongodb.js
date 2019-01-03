'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const Promise = require('bluebird');
const config = require('config');

module.exports = {
    connect,
    ping
};

// Set bluebird promises
mongoose.Promise = Promise;

let promise;

/**
 * Connect to the database
 * @return {Promise}
 */

function connect({ logger }) {
    if (promise) {
        return promise;
    }
    const mongoConfig = config.get('mongodb');

    promise = new Promise(function _mongoExecutor(resolve, reject) {
        mongoose.set('debug', mongoConfig.debug);
        const connectionString = `${mongoConfig.connectionString}/${config.get('database')}`;
        mongoose.connect(connectionString, _.pick(['db', 'server', 'replset', 'user', 'pass'], mongoConfig), connectCb);

        function connectCb(err) {
            /* istanbul ignore if */
            if (err) {
                return reject(err);
            }


            logger.info(`Mongodb: [${connectionString}]`);
            return resolve('Mongoose Connected');
        }
    });

    return promise;
}

/**
 * Pings the mongo db server
 * @return {Promise.<string>}
 */
function ping() {
    return connect()
        .then(function () {
            return new Promise(function (resolve, reject) {
                mongoose.connection.db.admin().ping((err, result) => {
                    return !err && result ? resolve('PONG') : reject(err);
                });
            });
        });
}
