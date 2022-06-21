const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controlle');
const isAuth = require('../middlewares/auth');

router.post('/add-address', isAuth, userController.addAddress);

router.get('/get-address', isAuth, userController.getAddresses);

router.delete('/delete-address', isAuth, userController.deleteAddress);

router.put('/update-address', isAuth, userController.updateAddress);

module.exports = router;