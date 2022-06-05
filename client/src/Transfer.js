import React, { useEffect, useState } from 'react';
import './App.css';

import getWeb3 from "./getWeb3";

import { signERC2612Permit  } from 'eth-permit';
import Receiver from './contracts/Receiver.json';

import { 
    Form, 
    Input, 
    Typography,
    Slider,
    PageHeader,
    Row,
    Statistic,
    Button,
    message
} from 'antd';

var sigUtil = require('eth-sig-util');
var ethUtil = require('ethereumjs-util');
const {config} = require('./config.js');

const Transfer=()=>
{
    //UI control
    const [showToast, setShowToast] = useState(false);

    const [web3, setWeb3] = useState(null); 
    const [accounts, setAccounts] = useState([]); 
    const [rContract, setRContract] = useState(null); 
    const [signer, setSigner] = useState('0x0000000000000000000000000000000000');
    const [netId, setNetId] = useState(0);

    // Input-UI Control
    const [tContractAddress, setTContractAddress] = useState('0x0000000000000000000000000000000000');
    const [rContractAddress, setRContractAddress] = useState('0x0000000000000000000000000000000000');
    const [rAccountAddress, setRAccountAddress] = useState('0x0000000000000000000000000000000000');
    const [amount, setAmount] = useState(0);
    const [ethAmount, setEthAmount] = useState(0);
    
    const key = 'updatable';

    useEffect(async () => {
        console.log("Mounting...");
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
      
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
      
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
      
            const rInstance = new web3.eth.Contract(
                Receiver.abi
            );
            setRContract(rInstance);
      
            // Get the singer address, default by index zero
            const signer = accounts[0];

            const ethBalance = web3.utils.fromWei(await web3.eth.getBalance(signer));
            setEthAmount(ethBalance)
      
            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            setWeb3(web3);
            setAccounts(accounts);
            setSigner(signer);
            setNetId(networkId);

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
              `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }   
    });
    
    async function signTnx(e) {
        e.preventDefault();

        
        rContract.options.address = rContractAddress;

        var owner = accounts[0];
        const spender = await rContract.options.address // Receiver contract address
        const to = rAccountAddress;
        const deadline = Date.now() + 100000;
        var value = amount;

        console.log('tContractAddress => ', tContractAddress);
        console.log('owner => ', owner);
        console.log('spender => ', spender);
        console.log('to => ', to);
        console.log('value => ', amount);
        console.log('deadline => ', deadline);
        
        try{
            web3.currentProvider.sendAsync({
                method: 'net_version',
                params: [],
                jsonrpc: '2.0'
            }, async function (err, result){
                
                const netId = result.result;
                console.log('netId', netId);

                var nonce_owner = await rContract.methods.getNonce(
                    tContractAddress,
                    owner
                )
                .call({from: owner});
                console.log('nonce_owner', nonce_owner);

                const msgParams = JSON.stringify({
                    types:
                    {
                        EIP712Domain:[
                        {name:"name",type:"string"},
                        {name:"version",type:"string"},
                        {name:"chainId",type:"uint256"},
                        {name:"verifyingContract",type:"address"}
                        ],
                        Permit:[
                        {name:"owner", type:"address"},
                        {name:"spender",type:"address"},
                        {name:"value", type: "uint256"},
                        {name:"nonce", type: "uint256"},
                        {name:"deadline",type:"uint256"}
                        ]
                    },
                    //make sure to replace verifyingContract with address of deployed contract
                    primaryType: "Permit",
                    domain: {name:"Receive-interview", version:"beta-1.0.0", chainId: netId, verifyingContract: tContractAddress},
                    message:{
                        owner: owner,
                        spender: spender,
                        value: value,
                        nonce: nonce_owner,
                        deadline: deadline
                    }
                });
        
                // currently signer is sender
                var params = [owner, msgParams];
                var method = 'eth_signTypedData_v3';
        
                web3.currentProvider.sendAsync({
                    method,
                    params,
                    owner
                }, async function (err, result){
                    if(err) return console.dir(err);
                    if(result.error) alert(result.error.message)
                    if(result.error) return console.error('ERROR', result);
            
                    console.log('TYPED SIGNED: ' + JSON.stringify(result.result));
                    const sig = result.result;

                    const requestOptions = {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            targetContractAddress: tContractAddress,
                            owner: owner,
                            spender: spender,
                            amount: amount,
                            deadline: deadline,
                            to: to,
                            sig: sig,
                            msgParams: msgParams
                        })
                    };

                    console.log('config.relayerEndpoint', config)
        
                    var api = config.relayerEndpoint;
        
                    fetch(api, requestOptions)
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);
                        if(result.code == 1) {
                            alert('Relayer service ERROR: ', result.msg)
                        }
                        else {
                            console.log(result);
                            openMessage(result.transaction_id);
                        }
                        
                    })
                    .catch(error => {
                        alert('Relayer service error ', error);
                    });
            
                    // verify signed address is equal to singer address
                    // const recovered = sigUtil.recoverTypedSignature({data: JSON.parse(msgParams), sig: result.result});
                    // if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(signer)) {
                    //     alert('Successfully ecRecovered signer as ' + signer)
                    // } else {
                    //     alert('Failed to verify signer when comparing ' + result + ' to ' + signer)
                    // }

                    // const signature = result.result.substring(2);
                    // const r = "0x" + signature.substring(0, 64);
                    // const s = "0x" + signature.substring(64, 128);
                    // const v = parseInt(signature.substring(128, 130), 16);
                    // console.log("r:", r);
                    // console.log("s:", s);
                    // console.log("v:", v);

                    // await rContract.methods.testCallPermit(
                    //     tContractAddress,
                    //     owner,
                    //     amount,
                    //     deadline,
                    //     v,
                    //     r,
                    //     s,
                    //     to
                    // ).send({ from: accounts[0] });

                    // await rContract.methods.testTransfer(
                    //     tContractAddress,
                    //     owner,
                    //     to,
                    //     amount
                    // ).send({from: owner});
                });
            })
        }
        catch(error){
            console.error(error);
        }
    }

    const onASChange = (newValue) => {
      setAmount(newValue);
    };

    const openMessage = (transaction_id) => {
        message.loading({ content: 'Transaction is sending to relayer', key });
        setTimeout(() => {
          message.success({ content: `Your transaction are queued in relayer with ${transaction_id}.`, key, duration: 2 });
        }, 1000);
    };

    return (
        <>
            <PageHeader>
                <Row>
                    <Statistic 
                        title="Connected Account" 
                        value={signer}
                    />

                    <Statistic
                        title="Amount"
                        prefix="ETH"
                        value={ethAmount}
                        style={{
                            margin: '0 32px',
                        }}
                    />
                    
                </Row>
            </PageHeader>

            <Form layout="vertical" autoComplete="off">
                <Form.Item name="tContractAddress" label="Token contract address">
                    <Input onChange={(e) => {setTContractAddress(e.target.value)}}/>
                </Form.Item>

                <Form.Item name="rContractAddress" label="Receiver contract address">
                    <Input onChange={(e) => {setRContractAddress(e.target.value)}}/>
                </Form.Item>

                <Form.Item name="rAccountAddress" label="To (Token Receiver) address">
                    <Input onChange={(e) => {setRAccountAddress(e.target.value)}}/>
                </Form.Item>

                <Form.Item name="amount" label="Amount">
                    <Slider
                        min={1}
                        max={10000}
                        onChange={onASChange}
                        value={amount}
                    />
                    <Input value={amount} onChange={(e) => {setAmount(e.target.value)}}/>
                </Form.Item>
            </Form>

            <Button 
                type='primary'
                onClick={signTnx}
            >
                Transfer
            </Button>
        </>
    );
}
export default Transfer;