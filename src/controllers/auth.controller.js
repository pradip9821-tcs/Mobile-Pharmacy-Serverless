const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { create, getUserByEmail } = require("../utils/dynamo/user.dynamo");
const { http, error_message, message } = require('../utils/constants/const');
const { successResponse, respondWithError } = require('../utils/response.helper');
const { generateId } = require('../utils/helper');
require('dotenv').config();

exports.signup = async (req, res, next) => {
    try {
        const payload = {
            name        : req.body.name,
            email       : req.body.email,
            password    : req.body.password,
            role        : req.body.role,
            gender      : req.body.gender,
            country_code: req.body.country_code,
            phone       : req.body.phone,
            store       : req.body.store,
            PK          : 'USER#' + generateId(5),
            createdAt   : new Date().toISOString(),
            updatedAt   : new Date().toISOString()
        };

        payload.SK = "-"
        for (let i = 0; i < req.files.length; i++) {
            if (req.files[i].mimetype === 'image/png' || req.files[i].mimetype === 'image/jpg' || req.files[i].mimetype === 'image/jpeg') {
                payload.image = {
                    name: req.files[i].originalname,
                    url: req.files[i].path,
                    type: req.files[i].mimetype
                };
            }
            else {
                return respondWithError(res, http.StatusBadRequest, error_message.FAILED_TO_UPLOAD, error);
            }
        }

        if (!payload.email || !payload.password || payload.role === undefined || !payload.image || payload.gender === undefined || !payload.country_code || !payload.phone || !payload.name) {
            return respondWithError(res, http.StatusBadRequest, error_message.INSUFFICIENT_DATA, undefined);
        }
        if (payload.role === '2') {
            if (!payload.store) {
                return respondWithError(res, http.StatusBadRequest, error_message.INSUFFICIENT_DATA, undefined);
            }
            payload.store = JSON.parse(payload.store)
        } else {
            payload.store = undefined
        }

        const user = await getUserByEmail(payload.email);
        if (user.Items.length !== 0) {
            return respondWithError(res, http.StatusConflict, error_message.USER_EXIST, undefined);
        }

        payload.password = await bcrypt.hash(payload.password, 12);

        await create(payload);
        return successResponse(res, http.StatusCreated, message.USER_CREATION_SUCCESS, undefined);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        const user = await getUserByEmail(payload.email);

        if (user.Items.length === 0) {
            return respondWithError(res, http.StatusNotFound, error_message.USER_NOT_EXIST, undefined);
        }

        const isEqual = await bcrypt.compare(payload.password, user.Items[0].password);
        if (!isEqual) {
            return respondWithError(res, http.StatusBadRequest, error_message.INVALID_PASSWORD, undefined);
        }

        user.Items[0].password = undefined
        const accessToken = jwt.sign({ user: user.Items[0] }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
        const refreshToken = jwt.sign({ user: user.Items[0] }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_LIFE });

        return successResponse(res, http.StatusOK, message.LOGIN_SUCCEED, { ...user.Items[0], accessToken, refreshToken });
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