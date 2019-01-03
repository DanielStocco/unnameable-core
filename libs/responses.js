module.exports = (req, res, next) => {
    res.ok = result => res.status(200).send({ code: 0, type: 'success', result});
    res.created = result => res.status(201).send({ code: 0, type: 'success', result});
    return next();
};
