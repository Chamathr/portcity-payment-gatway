var gatewayService = require('../service/gatewayService');
var utils = require('../scripts/util/commonUtils');
var view_path = '../templates';
var config = require('../scripts/config/config');
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
var CryptoJS = require("crypto-js");

/**
* Display page for Hosted Checkout operation
*
* @return response for hostedCheckout.ejs
*/
const makePayment = async (request, response, next) => {

    const queryData = request.query.userData;

    console.log('121')

    const data = {
        'userId': '059',
        'amount': 600
      }
    var ciphertext = (CryptoJS.AES.encrypt(JSON.stringify(data), 'portcity'))

    console.log('a', ciphertext)
    console.log('b', queryData)

    // Decrypt
    var bytes = CryptoJS.AES.decrypt(ciphertext, 'portcity');
    var originalText = (bytes.toString(CryptoJS.enc.Utf8));
    // const originalTextReplace = originalText.replace('.1.','+').replace('.2.','&')
    const txt = JSON.parse(originalText)

    console.log('1', txt)

    const orderId = txt.userId
    const amount = txt.amount

    // console.log(1, ciphertext)
    // console.log(2, txt.userId)

    const userIdExists = await prisma.payment.findUnique({
        where: {
            payment_id: orderId
        }
    })
    if (!userIdExists) {
        await prisma.payment.create({
            data: {
                payment_id: orderId,
                payment_status: 'PENDING'
            }
        })
    }

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
                "amount": amount
            });
            next();
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

    const result = request.params.result;
    const orderId = request.params.orderId;
    try {
        if (result == "SUCCESS") {

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