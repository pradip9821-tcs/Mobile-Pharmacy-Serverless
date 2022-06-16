const { status } = require("./constants/const");

exports.successResponse = (res, statuscode, message, data) => {
    return res.status(statuscode).json({ message, data, status: status.Success});
}

exports.respondWithError = (res, statuscode, error_message, error) => {
    if (error) {
        console.error(error);
    }
    return res.status(statuscode).json({ error_message, status : status.Failed });
}