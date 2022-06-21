const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const characters = uuidv4().split('-').join('').toUpperCase();

const generateId = (length) => {
    let id = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        id += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return id;
}

const clearImage = (filePath) => {
    filePath = path.join(__dirname, '../..', filePath);
    fs.unlink(filePath, err => console.log(err));
}

module.exports = {
    generateId,
    clearImage
}