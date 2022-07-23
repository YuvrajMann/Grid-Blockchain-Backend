// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;
pragma solidity ^0.8.1;

import "./Ownable.sol";

// Smart Contract for product warranty
contract Warranty is Ownable{
    /*
    The date and time is stored here in form os unix timestamp(https://www.unixtimestamp.com/) as unit256 variable type
    The start date for warranty
    */
    uint256 public start_date;
    
    // The end date for warranty
    uint256 public end_date;
    
    /* 
    The terms and condition assosiated with the warranty
    Stored as IPFS(https://ipfs.io/https://ipfs.io/) hashed string 
    */
    string public warranty_terms_and_conditions;

    //The constructor for smart contract 
    constructor(uint256 _start_date,uint256 _end_date,string memory _warranty_terms_and_conditions){
        start_date=_start_date;
        end_date=_end_date;
        warranty_terms_and_conditions=_warranty_terms_and_conditions;
    }

    //Modifier that checks if warranty is valid or not at current timestamp
    modifier underWarranty(){
        require(block.timestamp<end_date);
        _;
    }
}