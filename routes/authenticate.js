/**
 * Created by tomihei on 17/01/20.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var config      = require('../config/database'); // get db config file
var jwt         = require('jwt-simple');
var getToken = require('./cont/token');
var passport = require('passport');

router.get('/', passport.authenticate('jwt', {session: false}) ,function (req,res) {
    var token = getToken(req.headers);
    if(token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            user_email: decoded.user_email,
            user_password: decoded.user_password
        }, function (err, user) {
            if(err) throw err;
            if(!user) {
                return res.json({
                    msg: "auth failed",
                    success: false
                })
            } else {
                return res.json({
                    msg: "auth success",
                    success: true
                })
            }
        })
    }
});


/* GET home page. */
router.post('/login', function(req, res) {
    User.findOne({
        user_email: req.body.user_email
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
            res.send({success: false, mailAddressError: true, msg: 'Authentication failed. User not found.'});
        } else {
            // check if password matches
            user.comparePassword(req.body.user_password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    res.json({success: true, token: 'JWT ' + token});
                } else {
                    res.send({success: false, passwordError: true,msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
});

module.exports = router;
