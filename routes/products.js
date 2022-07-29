const User = require('../models/users')
const authenticate = require('../authenticate')
const productJSON = require('../build/Product.json')
const warrantyJSON = require('../build/Warranty.json')
let axios = require('axios')

function routes(app, db, lms, web3, accounts) {
  //Route for creating a new item to product list
  //Parameters to be passed:
  //display_name,price,image_url,retailer_name,purchase_date,maufacturer
  app.post(
    '/createNewItem',
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      console.log(req.user.user_blockchain_account_address)
      lms.product_manager_lms
        .addProduct(
          req.user.user_blockchain_account_address,
          req.body.serial_number,
          req.body.display_name,
          req.body.price,
          req.body.image,
          req.body._retailer,
          req.body._purchase_date,
          req.body._manufacturer,
          { from: req.user.user_blockchain_account_address },
        )
        .then((_hash, _address) => {
            res.json({
              status: 'success',
              transactionHash: _hash,
              transactionAddress: _address,
            })    
        })
        .catch((err) => {
          next(err)
        })
    },
  )

  // Route for singing the warranty
  // Parameters : serial_number,start_date,end_date,warranty_terms_and_conditions
  app.post(
    '/signWarranty',
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    async (req, res, next) => {
      lms.product_manager_lms
        .signWarranty(
          req.body.serial_number,
          req.body.start_date,
          req.body.end_date,
          req.body._warranty_terms_and_conditions,
          { from: req.user.user_blockchain_account_address },
        )
        .then((_hash, _address) => {
          res.json({
            status: 'warranty signed successfully for this product',
            transactionHash: _hash,
            transactionAddress: _address,
          })
        })
        .catch((err) => {
          next(err)
        })
    },
  )

  // Route for selling the product
  // Parameters : serial_number,new owner blockchain address

  app.post('/sellProduct', authenticate.verifyUser, (req, res, next) => {
    lms.product_manager_lms
      .sellProduct(req.body.serial_number,req.user.user_blockchain_account_address ,req.body.new_owner, {
        from: req.user.user_blockchain_account_address,
      })
      .then((_hash, _address) => {
        console.log(_hash.receipt)

        let timestamp = Math.floor(+new Date() / 1000)

        lms.product_manager_lms
          .saveOwnershipTransferTransaction(
            req.body.serial_number,
            req.body.new_owner,
            _hash.receipt.transactionHash,
            _hash.receipt.blockHash,
            timestamp,
            req.body.message,
            {
              from: req.user.user_blockchain_account_address,
            },
          )
          .then((result) => {
            res.json({
              status: 'Successfully sold product',
              transactionHash: _hash,
              transactionAddress: _address,
            })
          })
          .catch((err) => {
            console.log('First One')
            next(err)
          })
      })
      .catch((err) => {
        console.log('Second One')
        next(err)
      })
  })

  app.get(
    '/getAllOwnerShipTransferTransactions/:serialNumber',
    authenticate.verifyUser,
    (req, res, next) => {
      let serial_number = req.params.serialNumber
      lms.product_manager_lms
        .getAllTransferTransactions(serial_number)
        .then((resp) => {
          res.json({
            transactions: resp,
          })
        })
        .catch((err) => {
          next(err)
        })
    },
  )

  app.post(
    '/getWarranty/:serialNumber',
    authenticate.verifyUser,
    (req, res, next) => {
      let serial_number = req.params.serialNumber
      lms.product_manager_lms
        .getWarranty(serial_number, {
          from: req.user.user_blockchain_account_address,
        })
        .then(async (result) => {
          const contract_instance = new web3.eth.Contract(
            warrantyJSON.abi,
            result,
          )

          let start_date = await contract_instance.methods.start_date().call()
          let end_date = await contract_instance.methods.end_date().call()
          let _warranty_terms_and_conditions = await contract_instance.methods
            .warranty_terms_and_conditions()
            .call()

          res.json({
            start_date: start_date,
            end_date: end_date,
            warranty_terms_and_conditions: _warranty_terms_and_conditions,
          })
        })
        .catch((err) => {
          next(err)
        })
    },
  )

  app.get('/getOwnedItemsByUser', authenticate.verifyUser, (req, res, next) => {
    let user_address = req.user.user_blockchain_account_address
    lms.product_manager_lms
      .getAllProducts({
        from: req.user.user_blockchain_account_address,
      })
      .then(async (result) => {
        console.log(result);
        let myPromise = new Promise(function (myResolve, myReject) {
          let result_arr = []
          for (let i = 0; i < result.length; ++i) {
            let serial = result[i]
            lms.product_manager_lms
              .getProduct(serial, {
                from: req.user.user_blockchain_account_address,
              })
              .then(async (result1) => {
                const contract_instance = new web3.eth.Contract(
                  productJSON.abi,
                  result1,
                )
                let owner = await contract_instance.methods._owner().call()
                // console.log(owner,user_address);
                if (owner == user_address) {
                  result_arr.push(serial)
                }
               
                if (i == result.length-1) {
                  myResolve(result_arr)
                }
              })
              .catch((err) => {
                myReject(err)
              })
          }
        })
        myPromise
          .then((resp) => {
            res.json({
              owned_products: resp,
            })
          })
          .catch((err) => {
            next(err)
          })
      })
      .catch((err) => {
        next(err)
      })
  })

  app.post(
    '/getProduct/:serialNumber',
    authenticate.verifyUser,
    (req, res, next) => {
      let serial_number = req.params.serialNumber
      console.log(serial_number)
      lms.product_manager_lms
        .getProduct(serial_number, {
          from: req.user.user_blockchain_account_address,
        })
        .then(async (result) => {
          console.log(result)
          const contract_instance = new web3.eth.Contract(
            productJSON.abi,
            result,
          )
          let prod_id = await contract_instance.methods.prodId().call()
          let price = await contract_instance.methods.price().call()
          let image = await contract_instance.methods.image().call()
          let retailerName = await contract_instance.methods
            .retailerName()
            .call()
          let prodDisplayName = await contract_instance.methods
            .prodDisplayName()
            .call()
          let _purchase_date = await contract_instance.methods
            .prodDisplayName()
            .call()
          let manufacturer = await contract_instance.methods
            .manufacturer()
            .call()
          let owner = await contract_instance.methods._owner().call()
          res.json({
            prod_owner: owner,
            prod_id: prod_id,
            price: price,
            image: image,
            retailerName: retailerName,
            prodDisplayName: prodDisplayName,
            purchase_date: _purchase_date,
            manufacturer: manufacturer,
          })
        })
        .catch((err) => {
          next(err)
        })
    },
  )

  app.get(
    '/getSoldStaus/:serialNumber',
    authenticate.verifyUser,
    (req, res, next) => {
      let serial_number = req.params.serialNumber

      lms.product_manager_lms
        .prodSoldStaus(serial_number, {
          from: req.user.user_blockchain_account_address,
        })
        .then(async (result) => {
          res.json({ soldStatus: result })
        })
        .catch((err) => {
          next(err)
        })
    },
  )
  app.get(
    '/getWarrantyStatus/:serialNumber',
    authenticate.verifyUser,
    (req, res, next) => {
      let serial_number = req.params.serialNumber
      lms.product_manager_lms
        .prodWarrantyStaus(serial_number, {
          from: req.user.user_blockchain_account_address,
        })
        .then(async (result) => {
          res.json({ WarrantyStatus: result })
        })
        .catch((err) => {
          next(err)
        })
    },
  )
  app.get(
    '/getUseStatus/:serialNumber',
    authenticate.verifyUser,
    (req, res, next) => {
      let serial_number = req.params.serialNumber
      lms.product_manager_lms
        .getUseStaus(serial_number, {
          from: req.user.user_blockchain_account_address,
        })
        .then(async (result) => {
          res.json({ UseStatus: result })
        })
        .catch((err) => {
          next(err)
        })
    },
  )
  app.post(
    '/setUseStatus/:serialNumber',
    authenticate.verifyUser,
    (req, res, next) => {
      let serial_number = req.params.serialNumber
      lms.product_manager_lms
        .changingUseStaus(serial_number, req.body.newStatus, {
          from: req.user.user_blockchain_account_address,
        })
        .then(async (result) => {
          res.json({ status: 'Use Status updated successfully' })
        })
        .catch((err) => {
          next(err)
        })
    },
  )

  app.get('/getSerialNumberList', authenticate.verifyUser, (req, res, next) => {
    lms.product_manager_lms
      .getAllProducts({
        from: req.user.user_blockchain_account_address,
      })
      .then((result) => {
        res.json({ product_list: result })
      })
      .catch((err) => {
        next(err)
      })
  })
}

module.exports = routes
