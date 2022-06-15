exports.successResponse = (res, statuscode, message, data) => {
    return res.status(statuscode).json({ message, data, status: 1 });
}

exports.respondWithError = (res, statuscode, error_message, error) => {
    if (error) {
        console.error(error);
    }
    return res.status(statuscode).json({ error_message, status: 0 });
}