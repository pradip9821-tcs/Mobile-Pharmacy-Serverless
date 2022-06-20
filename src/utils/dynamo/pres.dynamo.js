const { dynamoClient } = require('../../services/database');
const TABLE_NAME = "Demo";

const getPrescriptionBySK = async (SK, struct) => {
    var params = {
        TableName: TABLE_NAME,
        ProjectionExpression : "PK",
        FilterExpression: "#SK = :skValue AND begins_with(#PK, :addRelation)",
        ExpressionAttributeNames: { "#SK": "SK", "#PK": "PK" },
        ExpressionAttributeValues: { ":skValue": SK, ":addRelation": struct }
    };
    return await dynamoClient.scan(params).promise();
}

const getItemBySK = async (SK, struct) => {
    var params = {
        TableName: TABLE_NAME,
        FilterExpression: "#SK = :skValue AND begins_with(#PK, :addRelation)",
        ExpressionAttributeNames: { "#SK": "SK", "#PK": "PK" },
        ExpressionAttributeValues: { ":skValue": SK, ":addRelation": struct }
    };
    return await dynamoClient.scan(params).promise();
}

const getItemById = async (PK,SK) => {
    var params = {
        TableName: TABLE_NAME,
        Key : {
            PK,
            SK
        }
    };
    return await dynamoClient.get(params).promise();
}

const getQuoteByPrescriptionId = async (presId) => {
    var params = {
        TableName: TABLE_NAME,
        FilterExpression: "#presID = :presValue",
        ExpressionAttributeNames: { "#presID": "prescriptionId"},
        ExpressionAttributeValues: { ":presValue": presId}
    };
    return await dynamoClient.scan(params).promise();
}

module.exports = {
    getItemBySK,
    getItemById,
    getPrescriptionBySK,
    getQuoteByPrescriptionId
}