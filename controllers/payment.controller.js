var gatewayService = require('../service/gatewayService');
var utils = require('../scripts/util/commonUtils');
var view_path = '../templates';
var config = require('../scripts/config/config');
require('dotenv').config()

/**
* Display page for Hosted Checkout operation
*
* @return response for hostedCheckout.ejs
*/
const makePayment = (request, response, next) => {
    const orderId = utils.keyGen(10);
    const requestData = {
        "apiOperation": "CREATE_CHECKOUT_SESSION",
        "order": {
            "id": orderId,
            "currency": utils.getCurrency(),
        },
        "interaction": {
            "operation": "AUTHORIZE",
            "returnUrl": "https://webhook.site/d0a1663d-e5e3-4a9e-858f-1df34b7c38f6"
            // "returnUrl": "https://122d-119-235-9-146.in.ngrok.io/"
        }
    }
    const apiRequest = { orderId: orderId };
    const requestUrl = gatewayService.getRequestUrl("REST", apiRequest);
    try {
        gatewayService.getSession(requestData, function (result) {
            response.render(view_path + '/hostedCheckout', {
                "baseUrl": config.TEST_GATEWAY.BASEURL,
                "apiVersion": config.TEST_GATEWAY.API_VERSION,
                "orderId": orderId,
                "merchant": result.merchant,
                "result": result.result,
                "session": {
                    "id": result.session.id,
                    "updateStatus": result.session.updateStatus,
                    "version": result.session.version
                },
                "successIndicator": result.successIndicator,
                // "returnUrl": '/process/hostedCheckout/'
                // "returnUrl": "https://webhook.site/d0a1663d-e5e3-4a9e-858f-1df34b7c38f6",
                // "returnUrl": "https://122d-119-235-9-146.in.ngrok.io/"
            });
            next();
        });
    }
    catch (error) {
        response.render(view_path + '/error', error);
    }

};


module.exports = {makePayment};