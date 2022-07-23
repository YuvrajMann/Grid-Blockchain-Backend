require('dotenv').config();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/users");

var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

passport.use(new LocalStrategy({ // or whatever you want to use
    usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
    passwordField: 'password'
  },User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Creates and return signed token
exports.getToken = (user) => {
  return jwt.sign(user, process.env.secretKey, { expiresIn: 172800 });
};

var opts = {};
//Exacting jwt web token we will use auth auth-header
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("Bearer");
opts.secretOrKey = process.env.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin=(req,res,next)=>{
  if(req.user.user_type=='admin'){
    next();
  }
  else{
    var err=new Error('User is not admin');
    next(err);
  }
}