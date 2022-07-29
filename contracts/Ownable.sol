// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;
pragma solidity ^0.8.1;

contract Ownable {
    //The blockchain account address is used to prove identity of the owner
    address public _owner;

    constructor(address owner){
        _owner = owner;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner(address sender) {
        require(isOwner(sender), "Ownable: caller is not the owner");
        _;
    }

    /**
    * @dev Returns true if the caller is the current owner.
    */
    function isOwner(address sender) public view returns (bool) {
        return (sender == _owner);
    }

    // Changing the ownership of the product after it is sold
    function alterOwnerShip (address owner,address new_owner) public onlyOwner(owner){
        _owner=new_owner;
    }
}
