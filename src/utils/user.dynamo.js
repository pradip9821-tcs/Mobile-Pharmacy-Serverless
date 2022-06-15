const { dynamoClient} = require('../services/database');

const addOrUpdateUser = async (user) => {
    const params = {
        TableName: 'users',
        Item: user
    }
    return await dynamoClient.put(params).promise();
}

const getUserByEmail = async (email) => {
    const params = {
        TableName: 'users',
        Key: {
            email
        }
    }
    return await dynamoClient.get(params).promise();
}

module.exports = {
    addOrUpdateUser,
    getUserByEmail
}