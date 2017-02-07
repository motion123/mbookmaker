/**
 * Created by tomihei on 17/01/20.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var config      = require('../config/database'); // get db config file
var jwt         = require('jwt-simple');

/* GET home page. */
router.post('/', function(req, res) {
    User.findOne({
        user_email: req.body.user_email
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            // check if password matches
            user.comparePassword(req.body.user_password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    res.json({success: true, token: 'JWT ' + token});
                } else {
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
});

module.exports = router;
