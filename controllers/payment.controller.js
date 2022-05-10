var gatewayService = require('../service/gatewayService');
var utils = require('../scripts/util/commonUtils');
var view_path = '../templates';
var config = require('../scripts/config/config');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
require('dotenv').config()

/**
* Display page for Hosted Checkout operation
*
* @return response for hostedCheckout.ejs
*/
const makePayment = async (request, response, next) => {
    const orderId = utils.keyGen(10);
    const requestData = {
        "apiOperation": "CREATE_CHECKOUT_SESSION",
        "order": {
            "id": orderId,
            "currency": utils.getCurrency()
        },
        "interaction": {
            "operation": "AUTHORIZE",
        }
    }
    
    const apiRequest = { orderId: orderId };
    const requestUrl = gatewayService.getRequestUrl("REST", apiRequest);
    try {
        gatewayService.getSession(requestData, async (result) => {
            response.render(view_path + '/payment', {
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
            });
            next();
        });
    }
    catch (error) {
        // response.status(500).send(error);
        response.render(view_path + '/error')
    }

};
const test = (request, response, next) => {
    response.render(view_path + '/error')
}
// router.get('/hostedCheckout/:orderId/:successIndicator/:sessionId', function (request, response, next) {
//     var sessionIndicator = request.params.successIndicator;
//     var orderId = request.params.orderId;
//     var sessionId = request.params.sessionId;
//     var resdata = {
//         "orderId": orderId,
//         "sessionId": sessionId,
//         "baseUrl": config.TEST_GATEWAY.BASEURL,
//         "apiVersion": config.TEST_GATEWAY.API_VERSION,
//         "merchant": '',
//         "result": '',
//         "session": {
//             "id": sessionId,
//             "updateStatus": '',
//             "version": ''
//         },
//         "successIndicator": sessionIndicator,
//         "returnUrl": '/process/hostedCheckout/'
//         "returnUrl": "https://webhook.site/d0a1663d-e5e3-4a9e-858f-1df34b7c38f6"
//     };
//     response.render(view_path + '/hostedCheckout', resdata);
// });
/**
* This method receives the callback from the Hosted Checkout redirect. It looks up the order using the RETRIEVE_ORDER operation and
* displays either the receipt or an error page.
*
* @param orderId needed to retrieve order
* @param result of Hosted Checkout operation (success or error) - sent from hostedCheckout.ejs complete() callback
* @return for hostedCheckoutReceipt page or error page
*/
const getResponse = async (request, response, next) => {
    
    const result = request.params.result;
    const orderId = request.params.orderId;
    try {
        if (result == "SUCCESS") {

            await prisma.payment.create({
                data: {
                    payment_id: orderId,
                    payment_status: 'PENDING'
                }
            })

            const apiRequest = { orderId: orderId };
            const requestUrl = gatewayService.getRequestUrl("REST", apiRequest);
            await gatewayService.paymentResult(requestUrl, async (error, result) => {

                if (error) {
                    const reserror = {
                        error: true,
                        title: "hostedCheckoutReceipt",
                        cause: "Payment was unsuccessful",
                        explanation: "There was a problem completing your transaction.",
                        field: null,
                        validationType: null
                    }
            
                    response.status(500).send(reserror);
                } else {
                    const ressuccess = {
                        error: false,
                        cause: "Payment was successful",
                        message: "Your transaction was successfully completed",
                        resbody: JSON.parse(result)
                    }
               
                    await prisma.payment.update(
                        {
                            where: { payment_id: orderId },
                            data: {
                                payment_status: 'SUCCESS'
                            }
                        }
                    )
                    response.redirect('https://www.espncricinfo.com/')
                }
            });
        } else {
            const reserror = {
                error: true,
                title: "hostedCheckoutReceipt",
                cause: "Payment was unsuccessful",
                explanation: "There was a problem completing your transaction.",
                field: null,
                validationType: null
            }

            await prisma.users.update(
                {
                    where: { payment_id: orderId },
                    data: {
                        payment_status: 'FAIL'
                    }
                }
            )
         
            response.status(500).send(reserror);

            next();
        }
    }
    catch (error) {
        response.status(500).send(error);
    }

};


module.exports = { makePayment, getResponse };