import * as express from 'express';
import Web3Helper from '../utils/getWeb3.util';
import RelayerBody from './relayer.interface';
import {TX_STATAUS} from '../DAO/status.type'
var sigUtil = require('eth-sig-util');

import CheckSigUtil from '../utils/checksig.util';
import { TransactionQueueDAO } from '../DAO/TransactionQueue.dao';
import {v4 as uuidv4} from 'uuid';

class RelayerController {
    public path = '/transfer';
    public router = express.Router();


    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.post(this.path, this.sendTransferTransactionAsRelayer);
    }

    sendTransferTransactionAsRelayer = async (request: express.Request, response: express.Response) =>{
      try{
        const requestBody: RelayerBody = request.body;
        console.log(requestBody);

        //Check the signature is equal to owner
        let checkUtil = new CheckSigUtil();
        if(checkUtil.checkSig(requestBody.msgParams, requestBody.sig, requestBody.owner))
        {
          // TODO: send into queue
          var insertDao = new TransactionQueueDAO();
          const rsv = checkUtil.getRSV(requestBody.sig);
          var transaction_id = uuidv4();
          var dbStatus = await insertDao.insertTransaction(
            transaction_id,
            requestBody.targetContractAddress,
            requestBody.owner,
            requestBody.amount,
            requestBody.deadline,
            rsv.v,
            rsv.r,
            rsv.s,
            requestBody.to,
            TX_STATAUS.PENDING,
            "",
            0
          );

          if(dbStatus.code == 1) response.send(dbStatus);
          response.send({code: 0, msg: "Transaction are stored in Relayer.", transaction_id: transaction_id})
          // Check the estimate gas - EIP 1559
        }
        else
        {
          response.send({code: 1, msg: "Invalid Signature"})
        }
      }
      catch(error: any)
      {
        response.send({code: 1, msg: "Something happened in transfer endpoint."});
      }
      
    }
}

export default RelayerController;