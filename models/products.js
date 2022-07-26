var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var Product = new Schema({
    serial_number:{
        type:String
    }
});

module.exports = mongoose.model("Product", Product);
