const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addOrUpdateUser, getUserByEmail } = require("../utils/user.dynamo");
require('dotenv').config();

exports.signup = async (req, res, next) => {
    try {
        const payload = { ...req.body, id: uuidv4().split('-').join('').toUpperCase() };

        if (!payload.email || !payload.password || payload.role === undefined || !payload.image || payload.gender === undefined || !payload.country_code || !payload.phone || !payload.name) {
            return res.status(400).json({ error_message: 'Please provide required data!', status: 0 });
        }
        if (payload.role === 2) {
            if (!payload.store_name || !payload.license_id) {
                return res.status(400).json({ error_message: 'Please provide required data!', status: 0 });
            }
        }

        const user = await getUserByEmail(payload.email);
        if (user.Item) {
            return res.status(404).json({ error_message: 'User already exist!', status: 0 });
        }

        payload.password = await bcrypt.hash(payload.password, 12);

        await addOrUpdateUser(payload);
        return res.status(200).json({ message: 'User created successfully.', status: 1 });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error_message: 'Something went wrong!', status: 0 });
    }
}

exports.login = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        const user = await getUserByEmail(payload.email);

        if (!user.Item) {
            return res.status(404).json({ error_message: 'User not found!', status: 0 });
        }

        const isEqual = await bcrypt.compare(payload.password, user.Item.password);
        if (!isEqual) {
            return res.status(400).json({ error_message: 'Invalid password!', status: 0 });
        }

        user.Item.password = undefined
        const accessToken = jwt.sign({ user: user.Item }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
        const refreshToken = jwt.sign({ user: user.Item }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_LIFE });

        return res.status(200).json({ message: 'Login succeed.', data: { ...user.Item, accessToken, refreshToken }, status: 1 });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error_message: 'Something went wrong!', status: 0 });
    }
}

exports.refreshToken = (req, res, next) => {
    try {
        jwt.verify(req.body.refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (!err) {
                const accessToken = jwt.sign({ user: user.user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
                return res.status(201).json({ message: 'AccessToken fetch succeed.', data: { accessToken }, status: 1 });
            }
            else {
                return res.status(500).json({ error_message: 'Invalid Refresh Token!', status: 0 });
            }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error_message: 'Something went wrong!', status: 0 });
    }
}