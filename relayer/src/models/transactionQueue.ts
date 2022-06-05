'use strict';
import { Model, UUIDV4} from 'sequelize';

interface TransactionQueueAttribute {
  transaction_id: string;
  token_address: string;
  owner_address: string;
  amount: number;
  deadline: number;
  v: number;
  r: string;
  s: string;
  to_address: string;
  status: string;
  transaction_hash: string;
  block_number: number;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Transaction_Queue extends Model<TransactionQueueAttribute> implements TransactionQueueAttribute {

    transaction_id!: string;    
    token_address!: string;
    owner_address!: string;
    amount!: number;
    deadline!: number;
    v!: number;
    r!: string;
    s!: string;
    to_address!: string;
    status!: string;
    transaction_hash!: string;
    block_number!: number;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      // define association here
    }
  }
  Transaction_Queue.init({
    transaction_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: UUIDV4
    },
    token_address: {
      type: DataTypes.STRING(100)
    },
    owner_address: {
        type: DataTypes.STRING(100)
    },
    deadline: {
      type: DataTypes.BIGINT,
    },
    v: {
      type: DataTypes.INTEGER,
    },
    r: {
      type: DataTypes.STRING,
    },
    s: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.INTEGER,
    },
    to_address: {
      type: DataTypes.STRING(100)
    },
    status: {
      type: DataTypes.STRING(100)
    },
    transaction_hash: {
      type: DataTypes.STRING(100)
    },
    block_number: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'Transaction_Queue',
    tableName: 'Transaction_Queue',
    underscored: true
  });
  return Transaction_Queue;
};
