const User = require('../models/users')
const authenticate = require('../authenticate')
const productJSON = require('../build/Product.json')
const warrantyJSON = require('../build/Warranty.json')

function routes(app, db, lms, web3, accounts) {
  app.post(
    '/createNewItem',
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      console.log(lms)
      lms.product_manager_lms
        .addProduct(
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

  app.post('/sellProduct', authenticate.verifyUser, (req, res, next) => {
    lms.product_manager_lms
      .sellProduct(req.body.serial_number, req.body.new_owner, {
        from: req.user.user_blockchain_account_address,
      })
      .then((_hash, _address) => {
        res.json({
          status: 'Successfully sold product',
          transactionHash: _hash,
          transactionAddress: _address,
        })
      })
      .catch((err) => {
        next(err)
      })
  })

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
   
      lms.product_manager_lms.prodSoldStaus(serial_number, {
          from:  '0x596436425bAc30F81309A31DF248dD514cDF164d',
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
  app.post("/setUseStatus/:serialNumber",authenticate.verifyUser,
  (req,res,next)=>{
    let serial_number = req.params.serialNumber
    lms.product_manager_lms
        .changingUseStaus(serial_number,req.body.newStatus, {
          from: req.user.user_blockchain_account_address,
        })
        .then(async (result) => {
          res.json({ status: 'Use Status updated successfully'});
        })
        .catch((err) => {
          next(err);
        })
  });
}

module.exports = routes
