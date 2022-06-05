import App from './app';
import RelayerController from './src/controllers/relayer.controller';
import { BlockchainGateway } from './src/services/blockchainGateway.service';
import { Timer } from './src/services/timer.service';
import Web3Helper from './src/utils/getWeb3.util';

const tnxConfig = require(__dirname + '/src/config/tnx_config.js');

const app = new App(
  [
    new RelayerController(),
  ],
  5000,
);
 
app.listen().then(async () => {
  
  const RelayerWeb3 = new Web3Helper();
  console.log("server config => ", tnxConfig)
  const web3 = await RelayerWeb3.getRelayerWeb3(tnxConfig.web3url);  
  const bc_servie = new BlockchainGateway();

  const timer = new Timer();
  timer.start(bc_servie, web3);
});