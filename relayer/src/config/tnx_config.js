require('dotenv').config();
module.exports= {
	maxGas : process.env.MAX_GAS_LIMIT,
    web3url : process.env.WEB3URL,
    timeout: process.env.TIMEOUT,
    privateKey: process.env.PIRVATE_KEY,
    receiverAddress: process.env.RECEIVER_ADDRESS
}