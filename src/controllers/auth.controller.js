const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addOrUpdateUser, getUserByEmail } = require("../utils/user.dynamo");
const { STATUSCODE } = require('../utils/constants/const');
const { successResponse, respondWithError } = require('../utils/response.helper');
require('dotenv').config();

exports.signup = async (req, res, next) => {
    try {
        const payload = { ...req.body, id: uuidv4().split('-').join('').toUpperCase() };

        if (!payload.email || !payload.password || payload.role === undefined || !payload.image || payload.gender === undefined || !payload.country_code || !payload.phone || !payload.name) {
            return respondWithError(res, STATUSCODE.BadRequest, 'Please provide required data!', undefined);
        }
        if (payload.role === 2) {
            if (!payload.store_name || !payload.license_id) {
                return respondWithError(res, STATUSCODE.BadRequest, 'Please provide required data!', undefined);
            }
        }

        const user = await getUserByEmail(payload.email);
        if (user.Item) {
            return respondWithError(res, STATUSCODE.Conflict, 'User already exist!', undefined);
        }

        payload.password = await bcrypt.hash(payload.password, 12);

        await addOrUpdateUser(payload);
        return successResponse(res, STATUSCODE.StatusOk, 'User created successfully.', undefined);
    }
    catch (error) {
        return respondWithError(res, STATUSCODE.InternalSereverError, 'Something went wrong!', error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        const user = await getUserByEmail(payload.email);

        if (!user.Item) {
            return respondWithError(res, STATUSCODE.NotFound, 'User not found!', undefined);
        }

        const isEqual = await bcrypt.compare(payload.password, user.Item.password);
        if (!isEqual) {
            return respondWithError(res, STATUSCODE.BadRequest, 'Invalid password!', undefined);
        }

        user.Item.password = undefined
        const accessToken = jwt.sign({ user: user.Item }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
        const refreshToken = jwt.sign({ user: user.Item }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_LIFE });

        return successResponse(res, STATUSCODE.StatusOk, 'Login succeed.', { ...user.Item, accessToken, refreshToken });
    }
    catch (error) {
        return respondWithError(res, STATUSCODE.InternalSereverError, 'Something went wrong!', error);
    }
}

exports.refreshToken = (req, res, next) => {
    try {
        jwt.verify(req.body.refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (!err) {
                const accessToken = jwt.sign({ user: user.user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
                return successResponse(res, STATUSCODE.StatusOk, 'AccessToken fetch succeed.', { accessToken });
            }
            else {
                return respondWithError(res, STATUSCODE.BadRequest, 'Invalid Refresh Token!', undefined);
            }
        });
    }
    catch (error) {
        return respondWithError(res, STATUSCODE.InternalSereverError, 'Something went wrong!', error);
    }
}