const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controlle');
const isAuth = require('../middlewares/auth');

router.post('/add-address', isAuth, userController.addAddress);

router.get('/get-address', isAuth, userController.getAddresses);

module.exports = router;