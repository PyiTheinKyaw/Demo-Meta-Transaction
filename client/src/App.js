import React, { useEffect, useState } from 'react';

import getWeb3 from "./getWeb3";

import { Layout, Menu, PageHeader, Tag, Typography} from 'antd';

import {
    BrowserRouter,
    Routes, //replaces "Switch" used till v5
    Route,
} from "react-router-dom";
import Transfer from './Transfer';

const { Header, Footer, Sider, Content } = Layout;
const { Paragraph } = Typography;
 
const App=()=>
{
    const [web3, setWeb3] = useState(null); 
    const [accounts, setAccounts] = useState([]); 
    const [signer, setSigner] = useState('0x0000000000000000000000000000000000');

    useEffect(async () => {
        console.log("Mounting...");
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
      
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
      
            // Get the singer address, default by index zero
            const signer = accounts[0];
      
            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            setWeb3(web3);
            setAccounts(accounts);
            setSigner(signer);
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
              `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }   
    });
    
    return(
        <>
            <Layout>
                <Header>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['transfer']}
                    >
                        <Menu.Item key="transfer">
                            <a href="/transfer" rel="noopener noreferrer">
                                Transfer
                            </a>
                        </Menu.Item>
                    </Menu>
                </Header>

                <Content style={{ padding: '0 50px' }}>
          
                    <PageHeader 
                        title="Relayer Demo"
                        subTitle="Meta-Transaction"
                        tags={<Tag color="blue">EIP 712</Tag>}
                    >
                    </PageHeader>
                    
                    <div className="site-layout-content">
                        <Paragraph>
                            
                            <pre>
                                In this project I used <Tag color="blue">EIP 712</Tag>
                                meta transaction, <Tag color="cyan">EIP 2612 </Tag> 
                                EIP-2612: permit – 712-signed approvals in Target Contract. All of permit request validation will be done in target token contract.
                                <br/>
                                Beware: This project is for only demostration purpose and does not contain proper error handling.
                            </pre>
                        </Paragraph>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<Transfer/>} />
                                <Route path="/transfer" element={<Transfer/>} />
                            </Routes>
                        </BrowserRouter>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}> Demostration by Pyi(Justin) Thein Kyaw</Footer>
            </Layout>
        </>
    );
}
 
export default App;