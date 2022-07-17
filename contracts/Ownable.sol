// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;
pragma solidity ^0.8.1;

contract Ownable {
    //The blockchain account address is used to prove identity of the owner
    address public _owner;

    constructor(){
        _owner = msg.sender;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }

    /**
    * @dev Returns true if the caller is the current owner.
    */
    function isOwner() public view returns (bool) {
        return (msg.sender == _owner);
    }

    // Changing the ownership of the product after it is sold
    function alterOwnerShip (address new_owner) public onlyOwner{
        _owner=new_owner;
    }
}
