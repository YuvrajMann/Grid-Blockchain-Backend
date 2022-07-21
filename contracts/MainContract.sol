// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;
pragma solidity ^0.8.1;

import "./Ownable.sol";
import "./Warranty.sol";
import "./Product.sol";

//Contract That manages all product details
contract ProductManager{
    /*
        Possible values for sold status for product
        Unsold - Item is not sold yet
        Sold - Item sold and ownership is assigned
    */
    enum SoldStatus {Unsold,Sold}
    /*
        Possible values for warranty status for product
        Signed - Warranty is signed for the product
        unsigned - Warranty is unsigned for the product
    */
    enum warrantyStatus {signed,unsigned}
    /*
        Possible values for use status of the product
        inuse - Product is currently in use by the customer
        sentforReplacemet - Product is sent for replacement on customer raising complaint
        underReview - Product is under review for replacement request
        requestRejected - Replacement request rejected
        requestAcceptedunderRepair - Replacement request accepted and item is under replair
        itemReadyToBeCollected - Item repaired and ready to be collected
    */
    enum useStatus {
        inUse,
        sentforReplacemet,
        underReview,
        requestRejected,
        requestAcceptedunderRepair,
        itemReadyToBeCollected
    }

    //Sturct of a particular item in product manager
    struct Item{
        //The specification of the product
        Product product_details;
        //The waranty contract of the product
        Warranty product_warranty;
        //Item sold or not
        ProductManager.SoldStatus sold_status;
        //Product warranty status
        ProductManager.warrantyStatus warranty_status;
        //Product use status
        ProductManager.useStatus use_status;
    }

    //The unique id for each product
    uint public prod_index;
    constructor(){
        prod_index=1;
    }
    //Mapping that maps the prod_index to the item struct
    mapping (uint=>Item) public items;
    struct data {
     uint val;
     bool isValue;
    }
    //Mapping that maps product serial Number to repective prod_index
    mapping (string=>uint) public serialNumberMapper;

    //Checking if serial number mapping is available  
    modifier serialNumberMaps(string memory serial_number){
        require(serialNumberMapper[serial_number]>0);
        _;
    }
    //Utility function that adds a new product to blockchain
    function addProduct(string memory serial_number,string memory display_name,uint256 _price,string memory _image,string memory _retailer,uint256 _purchase_date,string memory _manufacturer) public{
        //Creating a product object
        Product _product=new Product(serial_number,_price,_image,_retailer,display_name,_purchase_date,_manufacturer);
        //Assinging product to its repective prod_index
        items[prod_index].product_details=_product;
        //Intially product is unsold and warrant is unsigned
        items[prod_index].sold_status=SoldStatus.Unsold;
        items[prod_index].warranty_status=warrantyStatus.unsigned;
        //Assinging serial number to the prod_index of the product
        serialNumberMapper[serial_number]=prod_index;
        prod_index+=1;
    } 

    //Sign Warranty for product
    function signWarranty(string memory serial_number,uint256 _start_date,uint256 _end_date,uint256 _warranty_terms_and_conditions) public serialNumberMaps(serial_number)
    {
        uint contractProductId=serialNumberMapper[serial_number];
        //Getting warrant object
        Warranty _warranty=new Warranty(_start_date,_end_date,_warranty_terms_and_conditions);
        //Assinging the warranty object
        items[contractProductId].product_warranty=_warranty;   
        //Signing the warranty and making product use status as inuse
        items[contractProductId].warranty_status=warrantyStatus.signed;
        items[contractProductId].use_status=useStatus.inUse;
    }

    //Utility function that sells to product and assign a new owner to product
    function sellProduct(string memory serial_number,address newOwner) public serialNumberMaps(serial_number){
        uint contractProductId=serialNumberMapper[serial_number];
        //Changing the product sold status to sold
        items[contractProductId].sold_status=SoldStatus.Sold;
        //Changing/Transferring the ownership of product
        items[contractProductId].product_details.alterOwnerShip(newOwner);
    }

    //Changing use staus of the product
    function changingUseStaus(string memory serial_number,uint newUseStaus) public serialNumberMaps(serial_number){
        uint contractProductId=serialNumberMapper[serial_number];
        if(newUseStaus==0){
            items[contractProductId].use_status=useStatus.inUse;
        }
        else if(newUseStaus==1){
            items[contractProductId].use_status=useStatus.sentforReplacemet;
        }
        else if(newUseStaus==2){
            items[contractProductId].use_status=useStatus.underReview;
        }
        else if(newUseStaus==3){
            items[contractProductId].use_status=useStatus.requestRejected;
        }
        else if(newUseStaus==4){
            items[contractProductId].use_status=useStatus.requestAcceptedunderRepair;
        }
        else if(newUseStaus==5){
            items[contractProductId].use_status=useStatus.itemReadyToBeCollected;
        }
    }

    //Event that is emitted when someone want to get product details
    event ItemDetails(
        Product prod_address,
        uint sold_stauts,
        uint warranty_status,
        uint use_status
    );

    //Get details for the product based on serial number
    function getProduct(string memory serial_number) public serialNumberMaps(serial_number) {
        uint contractProductId=serialNumberMapper[serial_number];
        Product _item=items[contractProductId].product_details;
        emit ItemDetails(_item,uint(items[contractProductId].sold_status),uint(items[contractProductId].warranty_status),uint(items[contractProductId].use_status));
    }

    //Event that is emitted when someone want to get warranty details
    event WarantyDetails(
        Warranty warranty_address,
        uint sold_stauts,
        uint warranty_status,
        uint use_status
    );

    //Get warranty for product
    function getWarranty(string memory serial_number) public serialNumberMaps(serial_number){
        uint contractProductId=serialNumberMapper[serial_number];
        Warranty _product_warranty=items[contractProductId].product_warranty;
        emit WarantyDetails(_product_warranty,uint(items[contractProductId].sold_status),uint(items[contractProductId].warranty_status),uint(items[contractProductId].use_status));
    }
}
