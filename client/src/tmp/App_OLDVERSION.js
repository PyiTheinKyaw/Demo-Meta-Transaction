import React, { Component } from "react";
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import Receiver from './contracts/Receiver.json';
import getWeb3 from "./getWeb3";

import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

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
    contractAddress: '',
    targetContractAddress: '',
    balanceOfSigner: 0,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Receiver.networks[networkId];
      const instance = new web3.eth.Contract(
        Receiver.abi,
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

  onChangeTargetAddress (event) {
    this.setState({targetContractAddress: event.target.value});
  }

  signTnx = async() => {
    const { web3, accounts, contract, signer, uiStorageValue, contractAddress, targetContractAddress } = this.state;
    const expirationTimeSeconds = Date.now() + 100000;
    console.log('targetAddress', targetContractAddress);
    console.log('deadline', expirationTimeSeconds);
    console.log('uiStorageValue', uiStorageValue);
    console.log('signer', signer);
    const signerAddress = signer;
    const holder = signer;
    var amount = uiStorageValue;

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
          MintTransaction:[
            {name:"expirationTimeSeconds", type:"uint256"},
            {name:"signerAddress",type:"address"},
            {name: "targetContractAddress", type: "address"},
            {name: "holder", type: "address"},
            {name:"amount",type:"uint256"}
          ]
        },
        //make sure to replace verifyingContract with address of deployed contract
        primaryType: "MintTransaction",
        domain:{name:"Receive-interview", version:"beta-1.0.0", chainId:netId, verifyingContract: contractAddress},
        message:{
          expirationTimeSeconds: expirationTimeSeconds,
          signerAddress: signerAddress,
          targetContractAddress: targetContractAddress,
          holder: holder,
          amount: amount
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

        // const requestOptions = {
        //   method: 'POST',
        //   headers: {'Content-Type': 'application/json'},
        //   body: JSON.stringify({
        //     sig: result.result,
        //     expirationTimeSeconds: expirationTimeSeconds,
        //     signerAddress: signer,
        //     targetContractAddress: targetContractAddress,
        //     holder: holder,
        //     amount: amount
        //   })
        // }

        // var api = "http://localhost:5000/api/v1/relayer/mint";

        // fetch(api, requestOptions)
        // .then(response => response.json())
        // .then(result => {
        //    if(result.code == 1) alert('Relayer service ERROR: ', result.msg)
        //    console.log(result);
        //    alert('updated value from db: ', result.storageValue)
        // })
        // .catch(error => {
        //     alert('Relayer service error ', error);
        // });

        //getting r s v from a signature
        
        const signature = result.result.substring(2);
        const r = "0x" + signature.substring(0, 64);
        const s = "0x" + signature.substring(64, 128);
        const v = parseInt(signature.substring(128, 130), 16);
        console.log("r:", r);
        console.log("s:", s);
        console.log("v:", v);

        contract.methods.forwarderRequestTransfer(
          result.result, 
          expirationTimeSeconds,
          signerAddress,
          targetContractAddress,
          holder,
          amount
        ).send({ from: accounts[0] });

        // contract.methods.executeSetIfSignatureMatch(
        //   v,
        //   r,
        //   s, 
        //   expirationTimeSeconds,
        //   signerAddress,
        //   x
        // ).send({ from: accounts[0] });

      });
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      
        
        <Container fluid="md">
          <Row>
            <Col xs={2} md={4} lg={6}>
              <Card style={{ width: '100rem' }}>
                <Card.Body>
                  <Card.Title>Interview Assertment - EIP712 Relayer</Card.Title>
                  <Card.Text>
                    This project is only for demostration.
                  </Card.Text>
                  <Form>
                    <Form.Group className="mb-3" controlId="formBasicTContractAddress">
                      <Form.Control type="text" placeholder="Target Contract Address" onChange={this.onChangeTargetAddress.bind(this)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicVContractAddress">
                      <Form.Control type="text" placeholder="Receiver Contract Address" onChange={this.onChangeContractAddress.bind(this)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicAmount">
                      <Form.Control type="text" placeholder="Amount To Transfer" onChange={this.onChangeValue.bind(this)} />
                    </Form.Group>
                    
                    <Button variant="primary" onClick={() => {this.signTnx()}}>
                      Mint
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={2} md={4} lg={6}>
              <Card border="light">
                <Card.Text>
                  Signed Account Address : <strong>{this.state.signer}</strong>
                </Card.Text>
              </Card>
            </Col>
          </Row>
        </Container>
    );
  }
}

export default App;
