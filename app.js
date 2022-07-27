require('dotenv').config()
const express = require('express')
var mongoose = require('mongoose')
var passport = require('passport')
const app = express()
const Web3 = require('web3')
const mongodb = require('mongodb').MongoClient
const contract = require('truffle-contract')
const ProductManagerArtifacts = require('./build/ProductManager.json')
const ProductArtifact=require('./build/Product.json');
const users = require('./routes/users.js')
const products=require('./routes/products');
var authenticate = require('./authenticate')

app.use(express.json())
//Intilaizing the passport configuration defines in authenticate.js filr
app.use(passport.initialize())

//Intializing the web3 with the required blockchain provider
if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider)
} else {
  var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
}

//Importing and setting up built smart contract ABI
const ProductManagerLMS = contract(ProductManagerArtifacts);
ProductManagerLMS.setProvider(web3.currentProvider)

//Connecting to the mongoDb database
mongoose
  .connect(process.env.LDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    async (db) => {
      console.log('connected correctly to server!')
      // Getting all the ethereum accounts
      const accounts = await web3.eth.getAccounts()
      //The deployed product manager contract
      const product_manager_lms = await ProductManagerLMS.deployed();
 
      app.get('/', (req, res, next) => {
        res.end('Smart contract app')
      })
      
      //The user router
      users(app, db, {product_manager_lms:product_manager_lms}, accounts)
      //The products router
      products(app, db, {product_manager_lms:product_manager_lms},web3, accounts)

      //Starting up the server
      app.listen(process.env.PORT || 8082, () => {
        console.log('listening on port ' + (process.env.PORT || 8082))
      })
    },
    (err) => {
      console.log(err)
    },
);
