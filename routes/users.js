const User = require("../models/users");
var passport=require("passport");
var authenticate=require('../authenticate');

function routes(app, db,lms,accounts){
    app.post("/signup",(req,res,next)=>{
        User.register(
            new User({
              email: req.body.email,
              user_type:'admin',
              user_blockchain_account_address:accounts[req.body.number]
            }),
            req.body.password,
            (err, user) => {
              if (err) {
                console.log(err, req.body);
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ err: err });
              } else {
                passport.authenticate("local")(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json({ success: true, status: "Registration Successful!" });
                });
              }
            }
        );
    });

    app.post("/login", (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
          if (err) return next(err);
        console.log(user);
          if (!user) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "Login Unsuccessful!", err: info });
          }
          else{
            var token = authenticate.getToken({ _id: user._id });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Login Successful!", token: token,details:user });   
          }
        
        })(req, res, next);
    })
}

module.exports = routes
