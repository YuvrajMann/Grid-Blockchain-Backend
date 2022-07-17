// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;
pragma solidity ^0.8.1;

import "./Ownable.sol";
//Smart Contract for specifit product specification
contract Product is Ownable{
    //The Unique id of the product
    string public prodId;
    //The Price of the product
    uint256 public price;
    //The address of the image
    string public image;
    //Retailer name
    string public retailerName;
    //Product display name
    string public prodDisplayName;
    //Purchased on 
    uint256 public purchase_date;
    //Manufacturer
    string public manufacturer;


    constructor(
        string memory _prodId,
        uint256 _price,
        string memory _image,
        string memory _retailerName,
        string memory _prodDisplayName,
        uint256 _purchase_date,
        string memory _manufacturer){
            prodId=_prodId;
            price=_price;
            image=_image;
            retailerName=_retailerName;
            prodDisplayName=_prodDisplayName;
            purchase_date=_purchase_date;
            manufacturer=_manufacturer;
    }
     event ItemDetails(
        string prodId,
        uint256 price,
        string image,
        string retailerName,
        string prodDisplayName,
        uint256 puchase_date,
        string manufacturer
    );

    function logProduct() public{
        emit ItemDetails(
            string(prodId),
            uint256(price),
            string(image),
            string(retailerName),
            string(prodDisplayName),
            uint256(purchase_date),
            string(manufacturer)
        );
    }
}