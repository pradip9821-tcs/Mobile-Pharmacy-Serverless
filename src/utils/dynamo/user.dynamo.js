require('dotenv').config();
const { dynamoClient } = require('../../services/database');
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const create = async (data) => {
    const params = {
        TableName: TABLE_NAME,
        Item: data
    }
    return await dynamoClient.put(params).promise();
}

const update = async (data) => {
    const params = {
        TableName: TABLE_NAME,
        Item: data
    }
    return await dynamoClient.put(params).promise();
}

const getUserByEmail = async (email) => {
    var params = {
        TableName: TABLE_NAME,
        FilterExpression: "#email = :emailValue",
        ExpressionAttributeNames: { "#email": "email" },
        ExpressionAttributeValues: { ":emailValue": email }
    };
    return await dynamoClient.scan(params).promise();
}

const getSelectedAddressesBySK = async (SK) => {
    var params = {
        TableName: TABLE_NAME,
        FilterExpression: "#SK = :skValue AND begins_with(#PK, :addRelation) AND #is_select = :is_select",
        ExpressionAttributeNames: { "#SK": "SK", "#PK": "PK", "#is_select": "is_select" },
        ExpressionAttributeValues: { ":skValue": SK, ":addRelation": "ADDRESS#", ":is_select": 1 }
    };
    return await dynamoClient.scan(params).promise();
}

const deleteItemById = async (PK, SK) => {
    var params = {
        TableName: TABLE_NAME,
        Key: {
            PK,
            SK
        }
    };
    return await dynamoClient.delete(params).promise();
}

module.exports = {
    create,
    update,
    getUserByEmail,
    deleteItemById,
    getSelectedAddressesBySK
}