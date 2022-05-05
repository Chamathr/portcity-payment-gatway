var express = require('express');
var router = express.Router();
const payment = require('../controllers/payment.controller')

router.get('/pay', payment.makePayment);
router.get('/hostedCheckout/:orderId/:result', payment.getResponse)

module.exports = router;
