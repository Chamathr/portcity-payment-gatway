var express = require('express');
var router = express.Router();
const payment = require('../controllers/payment.controller')

router.post('/pay', payment.makePayment);
router.get('/pay/:orderId/:result', payment.getResponse)

router.get('/payment', payment.pay);
router.get('/page', payment.redirectPage);



module.exports = router;
