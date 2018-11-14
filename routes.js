const bodyparser = require("body-parser");
var {check, validationResult } = require("express-validator/check");
//const bcrypt = require("bcrypt");
const User = require("./models/User");

module.exports = function(app){
    const regValidation = [
        check("username")
            .not()
            .isEmpty()
            .withMessage("Username is required")
            .isLength({ min: 2})
            .withMessage("Username should be at least 2 letters"),

        check("password")
            .not()
            .isEmpty()
            .withMessage("Password is required"),

        check("address")
            .not()
            .isEmpty()
            .withMessage("Address is required")
            .isLength({min:42})
            .withMessage("Address is invalid"),

        check("username").custom(value =>{
            return User.findOne({ username: value}).then(function(user){
                if(user){
                    throw new Error("This username is already in use");
                }
            });
        }),

        check("address").custom(value=>{
            return User.findOne({ address:value}).then(function(user){
                if(user){
                    throw new Error("This address is already in use");
                }
            });
        })
    ];

    function register(req, res){
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.send({errors:errors.mapped()});
        }
        var user = new User(req.body);
        user.password = user.hashPassword(user.password);
        user
            .save()
            .then(user =>{
                req.session.user = user;
                req.session.isLoggedIn = true;
                return res.json(user);
            })
            .catch(err => res.send(err));
    }

    app.post("/api/register", regValidation, register);

    const logValidation = [
        check("username")
            .not()
            .isEmpty()
            .withMessage("Username is required"),
        check("password")
            .not()
            .isEmpty()
            .withMessage("Password is required")
    ];
    function loginUser(req, res){
        let errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.send({errors: errors.mapped()});
        }
        User.findOne({
            username : req.body.username
        }).then(function(user){
            if(!user){
                return res.send({error: true, message: "User does not exist!"});
            }
            if(!user.comparePassword(req.body.password, user.password)){
                return res.send({error:true, message:"Wrong password!"});
            }
            req.session.user = user;
            req.session.isLoggedIn = true;
            return res.json(user);
        })
            // .catch(function (error) {
            //     console.log(error);
            // });
            .catch(err => res.send(err));
    }
    app.post("/api/login", logValidation, loginUser);

    function isLoggedIn(req, res, next){
        if(req.session.isLoggedIn){
            res.send(true);
        }else{
            res.send(false);
        }
    }
    app.get("/api/isLoggedin", isLoggedIn);

    app.get("/api/logout", (req,res)=>{
        req.session.destroy();
        res.send({message:"Logged out!"});
    });

    app.get("/api/allUsers", getAllUsers);
    function getAllUsers(req, res) {
         User.find({address : /0x/i }, 'address', function(err, docs){
             if(err) console.log(err)
              res.send(docs);
             // console.log(docs);
         })
        // ,{projection:{_id:0, address: 1}}).toArray(
        //     function (err, result) {
        //         if (err) throw err;
        //         console.log(result);
        //    }
        // )
    }
};