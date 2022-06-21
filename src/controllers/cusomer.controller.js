const { http, error_message, message } = require("../utils/constants/const");
const { getQuoteByPrescriptionId, getItemById, getPrescriptionBySK } = require("../utils/dynamo/pres.dynamo");
const { create, deleteItemById, getSelectedAddressesBySK } = require("../utils/dynamo/user.dynamo");
const { generateId, clearImage } = require("../utils/helper");
const { respondWithError, successResponse } = require("../utils/response.helper");

exports.createPrescription = async (req, res, next) => {
    try {
        if (req.user.role === '2') {
            return respondWithError(res, http.StatusForbidden, error_message.FORBIDDEN, undefined);
        }

        const payload = {
            text_note   : req.body.text_note,
            medicines   : JSON.parse(req.body.medicines),
            status      : 0,
            PK          : 'PRES#' + generateId(5),
            SK          : req.user.PK,
            createdAt   : new Date().toISOString(),
            updatedAt   : new Date().toISOString()
        };

        let image_list = [];
        for (let i = 0; i < req.files.length; i++) {
            if (req.files[i].mimetype === 'image/png' || req.files[i].mimetype === 'image/jpg' || req.files[i].mimetype === 'image/jpeg') {
                image_list.push({
                    name    : req.files[i].originalname,
                    url     : req.files[i].path,
                    type    : req.files[i].mimetype
                });
            }
            else {
                return respondWithError(res, http.StatusBadRequest, error_message.FAILED_TO_UPLOAD, error);
            }
        }

        payload.image = image_list;

        await create(payload);

        return successResponse(res, http.StatusCreated, message.PRESCRIPTION_CREATION_SUCCESS, undefined);

    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.getPrescription = async (req, res, next) => {
    try {
        if (req.user.role === '2') {
            return respondWithError(res, http.StatusForbidden, error_message.FORBIDDEN, undefined);
        }

        let prescriptions = [];

        const presId = await getPrescriptionBySK(req.user.PK, 'PRES#');
        const presIds = presId.Items.map(prescription_id => prescription_id.PK);

        for (let i = 0; i < presIds.length; i++) {
            const prescription = await getItemById(presIds[i], req.user.PK);
            const quotes = await getQuoteByPrescriptionId(presIds[i]);

            prescription.Item.quotes = quotes.Items;
            prescription.Item.quotes_count = quotes.Items.length;

            prescriptions.push(prescription.Item)
        }

        return successResponse(res, http.StatusOK, message.PRESCRIPTION_FETCH_SUCCEED, prescriptions);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.deletePrescription = async (req, res, next) => {
    try {
        if (req.user.role === '2') {
            return respondWithError(res, http.StatusForbidden, error_message.FORBIDDEN, undefined);
        }
        if (!req.query.PK || !req.query.reason) {
            return respondWithError(res, http.StatusBadRequest, error_message.INSUFFICIENT_DATA, undefined);
        }

        const prescription = await getItemById(req.query.PK, req.user.PK);

        if (prescription.Item === undefined) {
            return respondWithError(res, http.StatusNotFound, error_message.PRESCRIPTION_NOT_EXIST, undefined);
        }

        for (let i = 0; i < prescription.Item.image.length; i++) {
            clearImage(prescription.Item.image[i].url)
        }

        await deleteItemById(req.query.PK, req.user.PK);

        return successResponse(res, http.StatusOK, message.PRESCRIPTION_DELETED_SUCCESS, undefined);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.getNearByPharmacy = async (req, res, next) => {
    try {
        if (req.user.role === '2') {
            return respondWithError(res, http.StatusForbidden, error_message.FORBIDDEN, undefined);
        }
        
        const address   = await getSelectedAddressesBySK(req.user.PK);
        if(address.Items.length === 0) {
            return respondWithError(res, http.StatusNotFound, error_message.ADDRESS_NOT_EXIST, undefined);
        }

        const user_lat  = address.Items[0].latitude;
        const user_long = address.Items[0].longitude;

        return successResponse(res, http.StatusOK, message.PRESCRIPTION_DELETED_SUCCESS, address);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}