const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')
const path = require('path');
const app = express();
const authRouters = require('./routers/auth.routes');
const userRouters = require('./routers/user.routes');
const custRouters = require('./routers/customer.routes');
const pharRouters = require('./routers/pharmacy.routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(multer().array())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },

    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

// Parse multer request.
app.use(multer({ storage: storage }).array('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.post('/', (req, res) => {
    res.send('Wlecome to mobile pharmacy backend...')
});

app.use('/auth', authRouters);
app.use('/user', userRouters);
app.use('/customer', custRouters);
app.use('/pharmacy', pharRouters);

module.exports = app;