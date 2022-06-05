// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Receiver {

    using Counters for Counters.Counter;
    mapping(address => mapping(address => Counters.Counter)) private _noncesManager;

    function callPermit(
        address[] memory tContractAddress,
        address[] memory owner,
        uint256[] memory amount,
        uint256[] memory deadline,
        uint8[] memory v,
        bytes32[] memory r,
        bytes32[] memory s,
        address[] memory to
    )
    public {
        uint256 i;
        // loop through all meta txs
        for (i = 0; i < tContractAddress.length; i++) {
            (bool success, bytes memory result) = tContractAddress[i].call
            (
                abi.encodeWithSignature(
                    "callTransfer(address,address,uint256,uint256,uint8,bytes32,bytes32)",
                    owner[i], 
                    address(this),
                    amount[i],
                    deadline[i],
                    v[i],
                    r[i],
                    s[i]
                )
            );

            if(!success){
                continue; 
            }
            _noncesManager[tContractAddress[i]][owner[i]].increment();
            ERC20 token = ERC20(tContractAddress[i]);
            token.transferFrom(owner[i], to[i], amount[i]);
        }
    }

    function getNonce(address tContractAddress, address owner) public view returns (uint256) {
        return _noncesManager[tContractAddress][owner].current();
    }
}