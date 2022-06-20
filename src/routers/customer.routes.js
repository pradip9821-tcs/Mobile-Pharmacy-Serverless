const express = require('express');
const router = express.Router();
const custController = require('../controllers/cusomer.controller');
const isAuth = require('../middlewares/auth');

router.post('/create-prescription', isAuth, custController.createPrescription);

router.get('/get-prescription', isAuth, custController.getPrescription);

module.exports = router;