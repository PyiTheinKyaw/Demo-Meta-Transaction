interface RelayerBody {
    targetContractAddress: string;
    owner: string;
    spender: string;
    amount: number;
    deadline: number;
    to: string;
    sig: string;
    msgParams: any;
}
   
export default RelayerBody;