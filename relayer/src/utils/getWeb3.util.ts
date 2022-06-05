const Web3 = require('web3');
const Accounts = require('web3-eth-accounts');
import Receiver from '../contracts/Receiver.json';
import IRelayerWeb3 from './getWeb3.interface';

class Web3Helper {

    private accounts: any;

    public async getRelayerWeb3(web3url: string): Promise<IRelayerWeb3> {
        
        const provider = new Web3.providers.HttpProvider(
            web3url
        );
        const web3 = new Web3(provider);        
        const ReceiverInstance = new web3.eth.Contract(
            Receiver.abi
        );

        var ret: IRelayerWeb3 = {
            web3,
            ReceiverInstance,
        }

        return ret
    }
}

export default Web3Helper;