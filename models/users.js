var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema({
    email: {
        type: String,
    },
    user_type:{
        type:String
    },
    user_blockchain_account_address:{
        type:String
    }
});

User.plugin(passportLocalMongoose,{ usernameField : 'email' });
module.exports = mongoose.model("User", User);
