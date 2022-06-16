const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addOrUpdateUser, getUserByEmail } = require("../utils/user.dynamo");
const { http, error_message, message } = require('../utils/constants/const');
const { successResponse, respondWithError } = require('../utils/response.helper');
require('dotenv').config();

exports.signup = async (req, res, next) => {
    try {
        const payload = { ...req.body, id: uuidv4().split('-').join('').toUpperCase() };

        if (!payload.email || !payload.password || payload.role === undefined || !payload.image || payload.gender === undefined || !payload.country_code || !payload.phone || !payload.name) {
            return respondWithError(res, http.StatusBadRequest, error_message.INSUFFICIENT_DATA, undefined);
        }
        if (payload.role === 2) {
            if (!payload.store_name || !payload.license_id) {
                return respondWithError(res, http.StatusBadRequest, error_message.INSUFFICIENT_DATA, undefined);
            }
        }

        const user = await getUserByEmail(payload.email);
        if (user.Item) {
            return respondWithError(res, http.StatusConflict, error_message.USER_EXIST, undefined);
        }

        payload.password = await bcrypt.hash(payload.password, 12);

        await addOrUpdateUser(payload);
        return successResponse(res, http.StatusOK, message.USER_CREATION_SUCCESS, undefined);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        const user = await getUserByEmail(payload.email);

        if (!user.Item) {
            return respondWithError(res, http.StatusNotFound, error_message.USER_NOT_EXIST, undefined);
        }

        const isEqual = await bcrypt.compare(payload.password, user.Item.password);
        if (!isEqual) {
            return respondWithError(res, http.StatusBadRequest, error_message.INVALID_PASSWORD, undefined);
        }

        user.Item.password = undefined
        const accessToken = jwt.sign({ user: user.Item }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
        const refreshToken = jwt.sign({ user: user.Item }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_LIFE });

        return successResponse(res, http.StatusOK, message.LOGIN_SUCCEED, { ...user.Item, accessToken, refreshToken });
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.refreshToken = (req, res, next) => {
    try {
        jwt.verify(req.body.refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (!err) {
                const accessToken = jwt.sign({ user: user.user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
                return successResponse(res, http.StatusOK, message.GET_TOKEN_SUCCEED, { accessToken });
            }
            else {
                return respondWithError(res, http.StatusBadRequest, error_message.INVALID_REFRESH_TOKEN, undefined);
            }
        });
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}