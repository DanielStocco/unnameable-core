module.exports = {
    checkCredentials
};

const bcrypt = require('bcrypt');
const basicAuth = require('basic-auth');
const models = require('@olpays/olp-models');
const mongoose = require('mongoose');

const { AuthError } = require('../errors/types');

async function checkCredentials(req, res, next) {
    let apiKey;
    const cred = basicAuth(req);

    if (!cred || !cred.name || !cred.pass) {
        return next(new AuthError('PERM_DENIED'));
    }

    if (!mongoose.Types.ObjectId.isValid(cred.name)) {
        return next(new AuthError('APIKEY_INVALID'));
    }

    try {
        apiKey = await getApiKey(cred.name);
        if (!apiKey) {
            return next(new AuthError('APIKEY_NOT_FOUND'));
        }

        const validKey = await bcrypt.compare(cred.pass, apiKey.hashedSecret);
        if (!validKey) {
            return next(new AuthError('APIKEY_NOT_MATCH'));
        }

        if (!mongoose.Types.ObjectId.isValid(apiKey.business)) {
            return next(new AuthError('BIZ_INVALID'));
        }

        const biz = await getBusiness(apiKey.business);

        if (!biz) {
            return next(new AuthError('BIZ_NOT_FOUND'));
        }
        req.business = biz;
    } catch (e) {
        return next(new AuthError('UNKNOWN', e));
    }

    return next();
}

/**
 * Get api key by id
 * @param keyId
 * @returns {Promise.<*>}
 */
async function getApiKey(keyId) {
    const apiKey = models.get('APIKey');
    return apiKey.findById(keyId);
}
// async function getApiKey(keyId) {
//     const apiKey = models.get('APIKey');
//     return apiKey.findOne({ _id: keyId, name: 'core-api' });
// }

/**
 * Get business by id
 * @param bizId
 * @returns {Promise.<*>}
 */
async function getBusiness(bizId) {
    const Business = models.get('business');
    return Business.findById(bizId);
}
