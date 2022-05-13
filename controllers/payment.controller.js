var gatewayService = require('../service/gatewayService');
var utils = require('../scripts/util/commonUtils');
var view_path = '../templates';
var config = require('../scripts/config/config');
require('dotenv').config()
var fs = require('fs');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
* Display page for Hosted Checkout operation
*
* @return response for hostedCheckout.ejs
*/
const makePayment = async (request, response, next) => {
    const orderId = utils.keyGen(10);

    await prisma.payment.create({
        data: {
            payment_id: orderId,
            payment_status: 'PENDING'
        }
    })

    const requestData = {
        "apiOperation": "CREATE_CHECKOUT_SESSION",
        "order": {
            "id": '78',
            "amount": 499,
            "currency": 'LKR',
            "description": 'Payment details',
            "currency": utils.getCurrency()
        },
        "interaction": {
            "merchant": config.TEST_GATEWAY.MERCHANTID,
            "operation": "AUTHORIZE",
            "merchant": {
                "name": 'Merchant Name',
                "address": {
                    "line1": '200 Sample St',
                    "line2": '1234 Example Town'
                }
            }
        },
    }

    const apiRequest = { orderId: orderId };
    const requestUrl = gatewayService.getRequestUrl("REST", apiRequest);
    try {
        gatewayService.getSession(requestData, async (result) => {
            response.send(`https://portcitcommercialpay.z19.web.core.windows.net/?userId=${orderId}&sessionId=${result.session.id}&successIndicator=${result.successIndicator}`)
        });
    }
    catch (error) {
        // response.status(500).send(error);
        response.render(view_path + '/error')
    }

};

/**
* This method receives the callback from the Hosted Checkout redirect. It looks up the order using the RETRIEVE_ORDER operation and
* displays either the receipt or an error page.
*
* @param orderId needed to retrieve order
* @param result of Hosted Checkout operation (success or error) - sent from hostedCheckout.ejs complete() callback
* @return for hostedCheckoutReceipt page or error page
*/
const getResponse = async (request, response, next) => {

    const orderId = request.params.orderId;
    try {
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
    }

    catch (error) {
        response.status(500).send(error);
    }

};

const redirectPage = async (reques, response) => {
    data = fs.readFile('D:/Projeccts/Port City/api/commercial-payment/controllers/test.html', (err, data) => {
        response.setHeader('Content-Type', 'text/html');
        response.send(data);
    });
}


module.exports = { makePayment, getResponse, redirectPage };