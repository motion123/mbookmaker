/**
 * Created by tomihei on 17/01/24.
 */
var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var config = require('../config/database'); // get db config file
var User = require('../models/user');
var passport = require('passport');
require('../config/passport')(passport);
var bcrypt = require('bcrypt');
var Board = require('../models/board');
var getToken = require('./cont/token');

router.post('/new', passport.authenticate('jwt', {session: false}), function(req, res,next) {
   var token = getToken(req.headers);
    if(token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            user_email: decoded.user_email
        }, function (err, user) {
            if(err) throw err;
            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
               req.userinfo = user; 
               next();
            }
        })
    }
});

router.post('/new',function (req,res) {
    var board = new Board();

    board.user_id = req.userinfo._id;
    board.title = req.body.title;
    board.description = req.body.description ? req.body.description : "";
    board.secret = req.body.secret;
    board.created_at = Date.now();

    board.save(function(err) {
        if (err)
            res.send(err);
        else
            res.json({ message: 'Board created!' });
    })
});

router.post('/edit', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        console.log(decoded._id);
        Board.findOne({
            user_id: decoded._id,
            _id: req.body.board_id
        }, function(err, board) {
            if (err) throw err;
            if (!board) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User or Board not found.'});
            } else {
                req.boardinfo = board;
                next();        
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/edit', function (req,res) {
    Board.findOneAndUpdate({_id: req.boardinfo._id},{
        title: req.body.title ? req.body.title : req.boardinfo.title,
        description: req.body.description ? req.body.description : req.boardinfo.description,
        secret: req.body.secret ? req.body.secret : req.boardinfo.secret,
        updated_at: Date.now()
    },{ runValidators: true, context: 'query'},function (err, success) {
        if(err) {
            res.send(err);
        } else {
            res.json({ message: "update success!"});
        }
    })
});

router.delete('/delete', passport.authenticate('jwt', { session: false}),function(req,res){
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        console.log(decoded._id);
        Board.remove({
            user_id: decoded._id,
            _id: req.body.board_id
        }, function(err) {
            if (err) {
                throw err;
            } else {
                res.json({ message: "board deleted!"});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

module.exports = router;
