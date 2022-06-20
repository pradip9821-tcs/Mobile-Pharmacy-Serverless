const { http, error_message, message } = require("../utils/constants/const");
const { getItemBySK } = require("../utils/dynamo/pres.dynamo");
const { create } = require("../utils/dynamo/user.dynamo");
const { generateId } = require("../utils/helper");
const { respondWithError, successResponse } = require("../utils/response.helper");

exports.createQuote = async (req, res, next) => {
    try {
        if (req.user.role === '1') {
            return respondWithError(res, http.StatusForbidden, error_message.FORBIDDEN, undefined);
        }

        const payload = {
            price: req.body.price,
            text_note: req.body.text_note,
            store_name: req.user.store.store_name,
            prescriptionId: req.body.prescription_id,
            PK: 'QUOTE#' + generateId(5),
            SK: req.user.PK,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        await create(payload);

        return successResponse(res, http.StatusCreated, message.QUOTE_CREATION_SUCCESS, undefined);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.getQuote = async (req, res, next) => {
    try {
        if (req.user.role === '1') {
            return respondWithError(res, http.StatusForbidden, error_message.FORBIDDEN, undefined);
        }

        const quote = await getItemBySK(req.user.PK, 'QUOTE#');

        return successResponse(res, http.StatusOK, message.QUOTE_FETCH_SUCCEED, quote.Items);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}