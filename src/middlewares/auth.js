require('dotenv').config();
const jwt = require('jsonwebtoken');
const { http, error_message, message } = require('../utils/constants/const');
const { respondWithError } = require('../utils/response.helper');

module.exports = (req, res, next) => {
    const authenticated = req.get('Authorization');
    if (!authenticated) {
        return respondWithError(res, http.StatusUnauthorized, error_message.UNAUTHORIZED, undefined);
    }

    const token = authenticated.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (!err) {
            req.user = user.user;
            next();
        } else {
            return respondWithError(res, http.StatusUnauthorized, error_message.UNAUTHORIZED, undefined);
        }
    })
}