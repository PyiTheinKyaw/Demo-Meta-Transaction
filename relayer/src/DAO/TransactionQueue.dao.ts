import db from '../models';
import {TX_STATAUS} from './status.type';

export class TransactionQueueDAO {
    async insertTransaction(
        tranaction_id: string,
        token_address: string,
        owner: string,
        amount: number,
        deadline: number,
        v: number,
        r: string,
        s: string,
        to: string,
        status: string,
        transaction_hash: string,
        block_number: number
    ): Promise<{code: 0 | 1, msg: string}>{

        try{
            // if any of them are not null,
            var tnfHistoryResult = await db.Transaction_Queue.create({
                tranaction_id,
                token_address,
                owner_address: owner,
                amount,
                deadline,
                v,
                r,
                s,
                to_address: to,
                status,
                transaction_hash,
                block_number
            });

            return {code: 0, msg: "DB: tx has been recored in queue list"};
        
        } catch(error) {
            if (error instanceof Error) {
                console.error(error.message);
            }

            return {code: 1, msg: "Error at DAO"};
        }
    }

    async getPendingTransactionCount() : Promise<{code: 0 | 1, msg: string, count: number}> {
        try{
            var pendingCount = await db.Transaction_Queue.count({
                where:{
                    status: TX_STATAUS.PENDING
                }
            });

            return {code: 0, msg: "DB: tx has been recored in queue list", count: pendingCount};
        
        } catch(error) {
            if (error instanceof Error) {
                console.error(error.message);
            }

            return {code: 1, msg: "Error at DAO", count: 0};
        }
    }

    async getPendingTransaction() : Promise<{code: 0 | 1, msg: string, pendingTnxs: any}> {
        try{
            var pendingTnx = await db.Transaction_Queue.findAll({
                where:{
                    status: TX_STATAUS.PENDING
                },
                order: [['updatedAt', 'ASC']]
            });

            return {code: 0, msg: "DB: tx has been recored in queue list", pendingTnxs: pendingTnx};
        
        } catch(error) {
            if (error instanceof Error) {
                console.error(error.message);
            }

            return {code: 1, msg: "Error at DAO", pendingTnxs: []};
        }
    }

    async updatePendingTransaction(transaction_id: string, status: TX_STATAUS) :Promise<{code: 0| 1, msg: string}> {
        try{
            await db.Transaction_Queue.update(
            {
                status: status
            },
            {
                where:{
                    transaction_id: transaction_id
                }
            });

            return {code: 0, msg: "DB: tx has been updated in queue list"};
        
        } catch(error) {
            if (error instanceof Error) {
                console.error(error.message);
            }

            return {code: 1, msg: "Error at DAO"};
        }
    }
}
