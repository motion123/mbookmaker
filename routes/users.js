var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var config = require('../config/database'); // get db config file
var User = require('../models/user');
var passport = require('passport');
require('../config/passport')(passport);
var bcrypt = require('bcrypt');
var getToken = require('./cont/token');

/* GET users listing. */
router.post('/new', function(req, res) {
  var user = new User();

  user.name = req.body.name;
  user.user_email = req.body.user_email;
  user.user_password = req.body.user_password;

  user.save(function(err,success) {
    if (err) {
      res.json({success:false,error: err});
    }
    if(success){
      var token = jwt.encode(success, config.secret);
      res.json({success: true, token: 'JWT ' + token});
    }
  })
});


router.post('/edit', passport.authenticate('jwt', { session: false}), function(req, res,next) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      user_email: decoded.user_email
    }, function (err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        req.userinfo = user;
        next();
      }
    })
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});


router.post('/edit', function(req, res,next) {
    if (req.body.user_password && req.body.user_password.length > 8) {
      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          return res.send(err)
        }
        bcrypt.hash(req.body.user_password, salt, function (err, hash) {
          if (err) {
            return res.send(err)
          }
          req.cryptpass = hash;
          next();
        });
      });
    } else {
     next();
    }
});

router.post('/edit', function(req,res){
  User.findOneAndUpdate({_id: req.userinfo._id},{
    name: req.body.name ? req.body.name : req.userinfo.name,
    user_email: req.userinfo.user_email,
    user_password: req.body.user_password ? req.cryptpass : requser.user_password,
    img: req.body.img ? req.body.img : req.userinfo.img ? req.userinfo.img : ""
  },{ runValidators: true, context: 'query'},function (err, success) {
    if (err) {
      res.send(err);
    } else {
      res.json({message: "update success!"});
    }
  })
});

router.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      user_email: decoded.user_email
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        res.json({success: true, msg: 'Welcome in the member area ' + user.user_email + '!'});
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

router.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      user_email: decoded.user_email
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        res.json({success: true, msg: 'Welcome in the member area ' + user.user_email + '!'});
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});


router.get('/:id', passport.authenticate('jwt', { session: false}), function(req, res,next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            user_email: decoded.user_email
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                if(user._id == req.params.id){
                    res.json({
                        success: true,
                        user_auth:true,
                        data: {
                            _id: user._id,
                            name: user.name,
                            img: user.img,
                        }
                    });
                }else {
                    req.userinfo = user;
                    next();
                }
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/:id', function (req,res) {
   User.findOne({
       _id : req.params.id
   },function(err,user){
       if(err) throw err;

       if(!user) {
           return res.status(403).send({success: false, msg: 'User Not Found'});
       }else {
           res.json({
               success: true,
               user_auth: false,
               data: {
                   _id: user._id,
                   name: user.name,
                   img: user.img,
               }
           });
       }
   })
});


module.exports = router;
