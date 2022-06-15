const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const authrouters = require('./routers/auth.routes')

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Wlecome to mobile pharmacy backend...')
});

app.use('/auth', authrouters);

module.exports = app;