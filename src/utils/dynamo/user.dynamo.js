const { dynamoClient } = require('../../services/database');
const TABLE_NAME = "Demo";

const create = async (data) => {
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

const getAddressesBySK = async (SK) => {
    var params = {
        TableName: TABLE_NAME,
        FilterExpression: "#SK = :skValue AND begins_with(#PK, :addRelation)",
        ExpressionAttributeNames: { "#SK": "SK", "#PK": "PK" },
        ExpressionAttributeValues: { ":skValue": SK, ":addRelation": "ADDRESS#" }
    };
    return await dynamoClient.scan(params).promise();
}

const deleteItemBySK = async (PK, SK) => {
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
    getUserByEmail,
    getAddressesBySK,
    deleteItemBySK
}