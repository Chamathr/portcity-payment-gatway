const request = require('request');
const config = require('../config/config');

const view_path = config.TEST_GATEWAY.BASEURL

const getStatus = async (req, res, next) => {
    try {
        request({
            method: 'GET',
            uri: 'https://cbcmpgs.gateway.mastercard.com/api/rest/version/63/information',
        }, (error, response, body) => {
            if (error) {
                return res.status(500).send(error);
            }
            const data = response.body;
            const apiData = JSON.parse(data)
            if (response.statusCode == 200) {
                res.send(apiData)
            }
            else {
                res.status(500).send("error with api call")
            }
        });
    }
    catch (error) {
        res.status(500).send(error)
    }
}

module.exports = { getStatus }