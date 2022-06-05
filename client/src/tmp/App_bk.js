import React, { Component } from "react";
import SimpleStorageContract from "../contracts/SimpleStorage.json";
import getWeb3 from "../getWeb3";

import "./App.css";

var ethUtil = require('ethereumjs-util');
var sigUtil = require('eth-sig-util');

class App extends Component {
  state = {
    storageValue: 0, 
    web3: null, 
    accounts: null,
    contract: null ,

    uiStorageValue: 0,
    signer: null,
    balanceOfSigner: 0,
    contractAddress: '',
    showConnectionError: false,
    showSuccess: false,

  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Get the singer address, default by index zero
      const signer = accounts[0];
      const balanceOfSigner = await web3.eth.getBalance(signer);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, signer, balanceOfSigner });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  onChangeValue(event) {
    this.setState({uiStorageValue: event.target.value});
  }

  onChangeContractAddress (event) {
    this.setState({contractAddress: event.target.value});
  }

  signTnx = async() => {
    const { web3, accounts, contract, signer, uiStorageValue, contractAddress } = this.state;
    const deadline = Date.now() + 100000;
    console.log('deadline', deadline);
    console.log('uiStorageValue', uiStorageValue);
    console.log('signer', signer);
    var x = uiStorageValue;

    web3.currentProvider.sendAsync({
      method: 'net_version',
      params: [],
      jsonrpc: '2.0'
    }, function (err, result){
      
      const netId = result.result;
      console.log('netId', netId);
      console.log('contractAddress', contractAddress);

      const msgParams = JSON.stringify({
        types:
        {
          EIP712Domain:[
            {name:"name",type:"string"},
            {name:"version",type:"string"},
            {name:"chainId",type:"uint256"},
            {name:"verifyingContract",type:"address"}
          ],
          set:[
            {name:"sender",type:"address"},
            {name:"x",type:"uint"},
            {name:"deadline", type:"uint"}
          ]
        },
        //make sure to replace verifyingContract with address of deployed contract
        primaryType: "set",
        domain:{name:"Sign Set Test", version:"beta", chainId:netId, verifyingContract: contractAddress},
        message:{
          sender: signer,
          x: x,
          deadline: deadline
        }
      });

      // currently signer is sender
      var params = [signer, msgParams];
      var method = 'eth_signTypedData_v3';

      web3.currentProvider.sendAsync({
        method,
        params,
        signer
      }, async function (err, result){
        if(err) return console.dir(err);
        if(result.error) alert(result.error.message)
        if(result.error) return console.error('ERROR', result);

        console.log('TYPED SIGNED: ' + JSON.stringify(result.result));

        // verify signed address is equal to singer address
        const recovered = sigUtil.recoverTypedSignature({data: JSON.parse(msgParams), sig: result.result});
        if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(signer)) {
          alert('Successfully ecRecovered signer as ' + signer)
        } else {
          alert('Failed to verify signer when comparing ' + result + ' to ' + signer)
        }

        const requestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            msgParams,
            sig: result.result,
            signer: signer,
            sender: signer,
            x: uiStorageValue,
            deadline
          })
        }

        var api = "http://localhost:5000/api/v1/relayer";

        fetch(api, requestOptions)
        .then(response => response.json())
        .then(result => {
           if(result.code == 1) alert('Relayer service ERROR: ', result.msg)
           console.log(result);
           alert('updated value from db: ', result.storageValue)
        })
        .catch(error => {
            alert('Relayer service error ', error);
        });

        //getting r s v from a signature
        
        // const signature = result.result.substring(2);
        // const r = "0x" + signature.substring(0, 64);
        // const s = "0x" + signature.substring(64, 128);
        // const v = parseInt(signature.substring(128, 130), 16);
        // console.log("r:", r);
        // console.log("s:", s);
        // console.log("v:", v);

        // await contract.methods.executeSetIfSignatureMatch(v,r,s, signer, deadline, x).send({ from: accounts[0] });
      });
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract with EIP 712 sign transaction Example</h2>

        <form>
          <label>
            Enter Verify Contract Address: 
            <input type="text" onChange={this.onChangeContractAddress.bind(this)}></input>
          </label>
          <br/>
          <br/>
          <label>
              Enter amount to change:  
              <input type="text" onChange={this.onChangeValue.bind(this)} />
          </label>

          <p> Signed Account Address : <strong>{this.state.signer}</strong></p>
          <p> Balance of Signed Account Address : <strong>{this.state.balanceOfSigner} Wei</strong></p>
        </form>

        <button onClick={() => {this.signTnx()}}> Press to sign</button>
        
      </div>
    );
  }
}

export default App;
