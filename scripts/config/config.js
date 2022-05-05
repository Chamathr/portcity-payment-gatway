require('dotenv').config() 
const CONFIG = {};
CONFIG.JWT = {
    SECRET: 'TEST_SECRET'
}
CONFIG.MODE = 'DEV';
CONFIG.PROD_MODE = CONFIG.MODE === 'DEV' ? false : true;
CONFIG.IS_CERT_AUTH_ENABLED = false;
CONFIG.CURRENCY = process.env.CURRENCY_LABEL;
CONFIG.TEST_GATEWAY = {
    BASEURL: process.env.GATEWAY_URL,
    API_VERSION: process.env.API_VERSION,
    USERNAME: 'merchant.' + process.env.MERCHANT_ID,
    PASSWORD: process.env.PASSWORD,
    MERCHANTID: process.env.MERCHANT_ID
};
CONFIG.PKI_GATEWAY = {
    BASEURL: process.env.GATEWAY_URL,
    API_VERSION: process.env.API_VERSION,
    MERCHANTID: process.env.MERCHANT_ID
}
CONFIG.WEBHOOKS = {
    WEBHOOKS_NOTIFICATION_SECRET: process.env.WEBHOOK_URL,
    WEBHOOKS_NOTIFICATION_FOLDER: 'webhooks-notifications'
}
CONFIG.SSL_FILES = {
    CRT: process.env.SSL_CRT_PATH,
    KEY: process.env.SSL_KEY_PATH
}
module.exports = CONFIG;