var express = require('express');
var router = express.Router();
const payment = require('../controllers/payment.controller')

router.get('/pay', payment.makePayment);
router.get('/pay/:orderId/:result', payment.getResponse)
router.get('/pay#__hc-action-cancel', payment.cancelProcess)

module.exports = router;
