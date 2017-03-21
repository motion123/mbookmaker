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
var InBoard = require('../models/inboard');
var Video = require('../models/video');
var paginate = require('express-paginate');
var mongoose = require('mongoose');


router.get('/:id/list', passport.authenticate('jwt', {session: false}), function(req, res,next) {
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

router.get('/:id/list', function(req,res,next) {
   Board.findOne({
       _id:req.params.id
   },function (err,success) {
       if(err) throw err;
       if(!success){
           return res.status(403).send({msg: 'Board not found.'});
       } else{
           next();
       }
   })
});

router.get('/:id/list',function(req,res){
    InBoard.paginate({
            board_id: req.params.id
    }, {
	        select: 'created_at video_description video_title url_id video_id',
	        sort:{created_at: 1},
            page: req.query.page,
            limit: req.query.limit
    },function (err,success) {
        if(err) throw err;
        if(!success) {
	        return res.status(404).send({success: false, msg: 'Board not found'});
        }else {
            res.json({
                success:true,
	            currentPage: success.page,
                pageCount: success.pages,
                itemCount: success.total,
                inBoardVideos: success.docs
            });
        }
    })

});

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

    board._user = req.userinfo._id;
    board.title = req.body.title;
    board.description = req.body.description ? req.body.description : "";
    board.secret = req.body.secret;

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
            _user: decoded._id,
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
    },{ runValidators: true, context: 'query'},function (err, success) {
        if(err) {
            res.send(err);
        } else {
            res.json({ message: "update success!"});
        }
    })
});

router.delete('/:id/delete', passport.authenticate('jwt', { session: false}),function(req,res){
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        console.log(decoded._id);
        Board.remove({
            _user: decoded._id,
            _id: req.params.id
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



router.get('/list/:id', passport.authenticate('jwt', {session: false}), function(req, res,next) {
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



router.get('/list/:id',function(req, res)  {
    Board.paginate({ _user: req.params.id},
        {
            select: 'title description updated_at count img',
            sort:{updated_at:-1},
            page: req.query.page,
            limit: req.query.limit
        }, function(err,success) {
            if(err) throw err;
            if(!success) {
                return res.status(404).send({success:false, msg: 'ボード一覧取得失敗'});
            }else {
                res.json({
                    success:true,
                    currentPage: success.page,
                    pageCount: success.pages,
                    itemCount: success.total,
                    boards: success.docs
                });
            }
        })
});

module.exports = router;
