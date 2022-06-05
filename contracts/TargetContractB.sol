// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC20, ERC20Permit} from "./IERC2612/ERC20Permit.sol";

contract TargetContractB is ERC20Permit {
    
    address public forwarder;

    constructor(uint256 initialSupply,address truthForwarder) ERC20("TCA_DEMOB", "TCB") {
        forwarder = truthForwarder;    
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    modifier onlyForwarder(){
        require(msg.sender == forwarder, "Function can only invoked by forwarder(proxy) contract");
        _;
    }

    function callTransfer(
        address owner,
        address spender,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) onlyForwarder public {
        permit(owner, spender, amount, deadline, v, r, s);
    }
}