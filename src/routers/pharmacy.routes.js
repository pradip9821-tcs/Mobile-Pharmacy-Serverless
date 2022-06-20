const express = require('express');
const router = express.Router();
const pharController = require('../controllers/pharmacy.controller')
const isAuth = require('../middlewares/auth');

router.post('/create-quote', isAuth, pharController.createQuote);

router.get('/get-quote', isAuth, pharController.getQuote);

module.exports = router;