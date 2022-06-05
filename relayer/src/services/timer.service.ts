import { TransactionQueueDAO } from "../DAO/TransactionQueue.dao";
import IRelayerWeb3 from "../utils/getWeb3.interface";
import { BlockchainGateway } from "./blockchainGateway.service";
const tnxConfig = require(__dirname + '/../config/tnx_config.js');

export class Timer {

    async start(bg: BlockchainGateway, relayer: IRelayerWeb3)
    {
        setInterval(bg.invokeTransaction, tnxConfig.timeout, new TransactionQueueDAO(), relayer);
    }
}