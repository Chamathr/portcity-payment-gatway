var express = require('express');
var router = express.Router();
const hostedCheckout = require('../controllers/hostedCheckout.controller')

router.get('/pay', hostedCheckout.makePayment);

module.exports = router;
