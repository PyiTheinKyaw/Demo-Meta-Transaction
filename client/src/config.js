require('dotenv').config();

console.log('process.env.WEB3_URL', process.env.WEB3_URL)

exports.config = {
    web3Url: process.env.REACT_APP_WEB3_URL,
    relayerEndpoint: process.env.REACT_APP_RELAYER_URL
}