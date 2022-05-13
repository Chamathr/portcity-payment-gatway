var express = require('express');
var router = express.Router();
const payment = require('../controllers/payment.controller')

router.post('/pay', payment.makePayment);
router.post('/payment', payment.pay);
router.get('/page', payment.redirectPage);
router.get('/pay/:orderId/:result', payment.getResponse)

module.exports = router;
