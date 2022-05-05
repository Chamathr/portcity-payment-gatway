var express = require('express');
var router = express.Router();
const payment = require('../controllers/payment.controller')

router.get('/pay', payment.makePayment);

module.exports = router;
