require('dotenv').config() 
var CONFIG = {};
CONFIG.JWT = {
    SECRET: 'TEST_SECRET'
}
CONFIG.MODE = 'DEV';
CONFIG.PROD_MODE = CONFIG.MODE === 'DEV' ? false: true;
CONFIG.IS_CERT_AUTH_ENABLED = false;
CONFIG.CURRENCY= 'LKR';
CONFIG.TEST_GATEWAY = {
    BASEURL: 'https://cbcmpgs.gateway.mastercard.com',
    API_VERSION: '61',
    USERNAME: 'merchant.' + 'TESTCOMTESIPGLKR',
    PASSWORD: 'c6da699bc3b2a8126633fc93a3aef96b' ,
    MERCHANTID: 'TESTCOMTESIPGLKR'
};
CONFIG.PKI_GATEWAY = {
    BASEURL: 'https://cbcmpgs.gateway.mastercard.com' ,
    API_VERSION: '61',
    MERCHANTID: 'TESTCOMTESIPGLKR'
}
CONFIG.WEBHOOKS = {
    WEBHOOKS_NOTIFICATION_SECRET : 'https://webhook.site/0a0b0de8-b29b-4ec6-8ea2-d18a7866200c',
    WEBHOOKS_NOTIFICATION_FOLDER : 'webhooks-notifications'
}
CONFIG.SSL_FILES = {
    CRT: process.env.SSL_CRT_PATH,
    KEY: process.env.SSL_KEY_PATH
}
module.exports = CONFIG;