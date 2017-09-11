const jwt = require('jsonwebtoken');
const models = require('../models/index');
const password = require('../utils/password');

function authentication(req, res, next) {
    if (req.headers.authorization) {
        console.log(req.headers);
        jwt.verify(req.headers.authorization, password.getTokenKey(), (err, decoded) => {
            if (!err && decoded) {
                req.user = { userId: decoded.userId };
            }
        });
    }
    next();
}

module.exports = authentication;