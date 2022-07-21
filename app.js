require('dotenv').config();
const express= require('express')
var mongoose = require("mongoose")
var passport=require('passport');
const app =express()
const routes = require('./routes')
const Web3 = require('web3');
const mongodb = require('mongodb').MongoClient
const contract = require('truffle-contract');
const artifacts = require('./build/ProductManager.json');
const users=require('./routes/users.js');
var authenticate = require("./authenticate");

app.use(express.json())
app.use(passport.initialize());

if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider)
  } else {
    var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
}

const LMS = contract(artifacts)
LMS.setProvider(web3.currentProvider)


mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(
  async(db)=>{
    // console.log(web3);
    const accounts = await web3.eth.getAccounts();
    const lms = await LMS.deployed();
    app.get("/",(req,res,next)=>{
      res.end('Smart contract app');
    });
    // const lms = LMS.at(contract_address) for remote nodes deployed on ropsten or rinkeby
    users(app,db,lms,accounts);
    // routes(app,db, lms, acckounts)
    app.listen(process.env.PORT || 8082, () => {
       console.log('listening on port '+ (process.env.PORT || 8082));
     })
  },  
  (err)=>{
    console.log(err);
  }
);

// mongoose.connect(process.env.DB,{ useUnifiedTopology: true }, async(err,client)=>{
//     const db =client.db('Cluster0')
//     const accounts = await web3.eth.getAccounts();
//     const lms = await LMS.deployed();
//     //const lms = LMS.at(contract_address) for remote nodes deployed on ropsten or rinkeby
//     routes(app,db, lms, acckounts)
//     app.listen(process.env.PORT || 8082, () => {
//        console.log('listening on port '+ (process.env.PORT || 8082));
//      })
// })
