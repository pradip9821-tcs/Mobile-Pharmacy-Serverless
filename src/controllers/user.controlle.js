const { http, message, error_message } = require("../utils/constants/const");
const { generateId } = require("../utils/helper");
const { successResponse, respondWithError } = require("../utils/response.helper");
const { create, deleteItemById, getSelectedAddressesBySK, update } = require("../utils/dynamo/user.dynamo");
const { getItemById, getItemBySK } = require("../utils/dynamo/pres.dynamo");

exports.addAddress = async (req, res, next) => {
    try {
        const payload = {
            primary_address         : req.body.primary_address,
            addition_address_info   : req.body.addition_address_info,
            address_type            : req.body.address_type,
            latitude                : req.body.latitude,
            longitude               : req.body.longitude,
            is_select               : req.body.is_select,
            PK                      : 'ADDRESS#' + generateId(5),
            SK                      : req.user.PK,
            createdAt               : new Date().toISOString(),
            updatedAt               : new Date().toISOString()
        };

        if(payload.is_select === 1){
            const address = await getSelectedAddressesBySK(req.user.PK);
            if(address.Items.length !== 0){
                address.Items[0].is_select = 0
                await update(address.Items[0])
            }
        }
        await create(payload);
        return successResponse(res, http.StatusCreated, message.ADDRESS_CREATION_SUCCESS, undefined);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.getAddresses = async (req, res, next) => {
    try {
        const address = await getItemBySK(req.user.PK,"ADDRESS#");

        return successResponse(res, http.StatusOK, message.ADDRESS_FETCH_SUCCEED, address.Items);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.deleteAddress = async (req, res, next) => {
    try {
        if (!req.query.PK) {
            return respondWithError(res, http.StatusBadRequest, error_message.INSUFFICIENT_DATA, undefined);
        }
        const address = await getItemById(req.query.PK, req.user.PK);
        if(address.Item === undefined){
            return respondWithError(res, http.StatusNotFound, error_message.ADDRESS_NOT_EXIST, undefined);
        }
        await deleteItemById(req.query.PK, req.user.PK);

        return successResponse(res, http.StatusOK, message.ADDRESS_DELETED_SUCCESS, undefined);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}

exports.updateAddress = async (req, res, next) => {
    try {
        const address = await getItemById(req.query.PK, req.user.PK) 
        if(!address.Item) {
            return respondWithError(res, http.StatusNotFound, error_message.ADDRESS_NOT_EXIST, undefined);
        }

        const payload = {
            primary_address         : req.body.primary_address          || address.Item.primary_address,
            addition_address_info   : req.body.addition_address_info    || address.Item.addition_address_info,
            address_type            : req.body.address_type             || address.Item.address_type,
            latitude                : req.body.latitude                 || address.Item.latitude,
            longitude               : req.body.longitude                || address.Item.longitude,
            is_select               : req.body.is_select                || address.Item.is_select,
            SK                      : address.Item.SK,
            PK                      : address.Item.PK,
            updatedAt               : new Date().toISOString()
        };

        if(req.body.is_select === 1){
            const address = await getSelectedAddressesBySK(req.user.PK);
            if(address.Items.length !== 0){
                address.Items[0].is_select = 0
                await update(address.Items[0])
            }
        }
        await update(payload);
        return successResponse(res, http.StatusOK, message.ADDRESS_CREATION_SUCCESS, undefined);
    }
    catch (error) {
        return respondWithError(res, http.StatusInternalServerError, error_message.INTERNAL_ERROR, error);
    }
}