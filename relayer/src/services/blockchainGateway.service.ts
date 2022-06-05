import { TX_STATAUS } from "../DAO/status.type";
import { TransactionQueueDAO } from "../DAO/TransactionQueue.dao";
import CheckSigUtil from "../utils/checksig.util";
import IRelayerWeb3 from "../utils/getWeb3.interface";
const tnxConfig = require(__dirname + '/../config/tnx_config.js');
const Accounts = require('web3-eth-accounts');

export class BlockchainGateway {
    constructor(){
        // Setup the account for send transaction
    }

    // this function will run every timeout as in config.
    async invokeTransaction(DAO: TransactionQueueDAO, relayer: IRelayerWeb3)
    {
        const result = await DAO.getPendingTransactionCount();
        if(result.code == 0 && result.count > 0)
        {
            console.log('Server start to invoke the transaction to smartcontract. Tx.count in queue => ', result.count);
            
            var accounts = new Accounts();
            let accountAddress = accounts.privateKeyToAccount('0x' + tnxConfig.privateKey.toString("hex")).address
            // const accounts = await relayer.web3.eth.getAccounts();
            const relayerAddress = accountAddress;

            relayer.ReceiverInstance.options.address = tnxConfig.receiverAddress;

            const netId = await relayer.web3.eth.net.getId();
            var MAX_GAS_LIMIT = tnxConfig.maxGas
            // logging 
            console.log('relayerAddress => ', relayerAddress);
            console.log('netId => ', netId);
            console.log('MAX_GAS_LIMIT => ', MAX_GAS_LIMIT);
            
            // Get the pending transaction
            var pendTnxResult = await DAO.getPendingTransaction();

            var transactionIdArr: string[] = [];
            var tContractAddressArr: string[] = [];
            var ownerArr: string[] = [];
            var amountArr: number[] = [];
            var deadlineArr: number[] = [];
            var vArr: number[] = [];
            var rArr: string[] = [];
            var sArr: string[] = [];
            var toArr: string[] = [];
      
            // Call methods from smart contract 
            try {
                var avaliableTnx: number = 0;
                var totalEstimatedGasAmount: number=0;
                for(var i=0; i < pendTnxResult.pendingTnxs.length; i++){
                    var tnx = pendTnxResult.pendingTnxs[i];

                    transactionIdArr.push(tnx.transaction_id);
                    tContractAddressArr.push(tnx.token_address);
                    ownerArr.push(tnx.owner_address);
                    amountArr.push(tnx.amount);
                    deadlineArr.push(tnx.deadline);
                    vArr.push(tnx.v);
                    rArr.push(tnx.r);
                    sArr.push(tnx.s);
                    toArr.push(tnx.to_address);

                    //estimate gas
                    try{
                        var gasAmount = await relayer.ReceiverInstance.methods.callPermit(
                            tContractAddressArr,
                            ownerArr,
                            amountArr,
                            deadlineArr,
                            vArr,
                            rArr,
                            sArr,
                            toArr
                        )
                        .estimateGas({from: relayerAddress});

                        console.log("Estimate GasAmount => ", gasAmount);

                        console.log("MAX_GAS_LIMIT => ", MAX_GAS_LIMIT);
                        if(MAX_GAS_LIMIT < gasAmount) {
                            transactionIdArr.pop();
                            tContractAddressArr.pop();
                            ownerArr.pop();
                            amountArr.pop();
                            deadlineArr.pop();
                            vArr.pop();
                            rArr.pop();
                            sArr.pop();
                            toArr.pop();
                            break;
                        }
                        
                        // it's still good to go
                        MAX_GAS_LIMIT = MAX_GAS_LIMIT - gasAmount;
                        totalEstimatedGasAmount = totalEstimatedGasAmount + gasAmount;
                        avaliableTnx++;
                    }
                    catch(err) {
                        console.error('Estimation error ', err);
                        transactionIdArr.pop();
                        tContractAddressArr.pop();
                        ownerArr.pop();
                        amountArr.pop();
                        deadlineArr.pop();
                        vArr.pop();
                        rArr.pop();
                        sArr.pop();
                        toArr.pop();

                        DAO.updatePendingTransaction(tnx.transaction_id, TX_STATAUS.ERROR);

                        break;
                    }
                }

                console.log('avaliableTnx', avaliableTnx);
                console.log('transactionIdArr', transactionIdArr);

                //loop the normalize transacction to update
                transactionIdArr.map(async (txId, index) => {
                    //Update status in database.
                    await DAO.updatePendingTransaction(txId, TX_STATAUS.COMMITED);
                });

                if(avaliableTnx != 0 ){
                    //Send transaction to smart contract
                    await relayer.ReceiverInstance.methods.callPermit(
                        tContractAddressArr,
                        ownerArr,
                        amountArr,
                        deadlineArr,
                        vArr,
                        rArr,
                        sArr,
                        toArr
                    )
                    .send({
                        from: relayerAddress,
                        gasLimit: gasAmount
                    })
                    .on('receipt', function(receipt: any){
                        console.log(receipt.events);
                    })
                    .on('error', function(error: any, receipt: any) {
                        throw "Blockchain Transaction failed"
                    });
                }
                
            }
            catch(error){
                console.error(error);
            }
        }
        else {
            console.log(`There is no transaction in queue.`)
        }
    }
}