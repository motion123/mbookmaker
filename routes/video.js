/**
 * Created by tomihei on 17/02/05.
 */
var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var config = require('../config/database'); // get db config file
var User = require('../models/user');
var passport = require('passport');
require('../config/passport')(passport);
var bcrypt = require('bcrypt');
var Video = require('../models/video');
var Board = require('../models/board');
var InBoard = require('../models/inboard');
var getToken = require('./cont/token');
var paginate = require('express-paginate');


router.use(passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if(token){
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            user_email: decoded.user_email
        },function (err, user) {
            if(err) throw err;
            if(!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed.'});
            } else {
                req.userinfo = user;
                next();
            }
        })
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/new', function (req,res,next) {
    var newVideo = new Video();
    Video.findOne({
        url: req.body.url
    },function (err, video){
        if(err) throw err;
        if(!video) {
            newVideo.url = req.body.url;
            newVideo.user_id = req.userinfo._id;
            newVideo.created_at = new Date();

            newVideo.save(function (err,success) {
                if(err)
                    res.status(403).send(err);
                else
                    req.videoinfo = success;
                    next();
            });
        } else {
            req.videoinfo = video;
            next();
        }
    })
});

router.post('/new', function (req,res) {
    Board.findOne({
        user_id: req.userinfo._id,
        _id: req.body.board_id
    },function(err,board) {
        if(err) throw err;
        if(!board) {
            return res.status(403).send({success: false, msg: 'Authentication failed. Board not found.'});
        } else {
            var inboard = new InBoard();

            inboard.user_id = req.userinfo._id;
            inboard.user_name = req.userinfo.name;
            inboard.board_id = req.body.board_id;
            inboard.board_title = board.title;
            inboard.video_id = req.videoinfo._id;
            inboard.url = req.videoinfo.url;
            inboard.video_title = req.body.video_title;
            inboard.video_description = req.body.video_description ? req.body.video_description : "";
            inboard.created_at = new Date();

            inboard.save(function (err, success) {
                if (err)
                    res.status(403).send(err);
                else
                    res.status(200).send(success);
            })
        }
    })
});

router.get('/:id', function (req,res) {
   InBoard.findOne({video_id: req.params.id})
       .sort({created_at: 1})
       .exec(function (err, success){
        if(err) throw err;　
        if(!success) {
            return res.status(404).send({success: false, msg: 'Video not found'});
        } else {
            res.send(success);
        }
       })
});

router.get('/:id/info', function(req,res){
   InBoard.paginate({
       video_id: req.params.id,
   }, {
        select: 'user_id user_name board_id board_title created_at',
        sort: { created_at: 1},
        page: req.query.page,
        limit: req.query.limit
   }, function(err, success) {
       if(err) return res.status(403).send(err);
       if(success.total == 0) {
           return res.status(404).send({success: false, msg: 'Video not found'});
       } else {
           res.json({
               currentPage: success.page,
               pageCount: success.pages,
               itemCount: success.total,
               inBoard: success.docs
           });
       }
   })
});

router.post('/delete',function(req,res){
    InBoard.remove({
      user_id: req.userinfo._id,
      board_id: req.body.board_id,
      video_id: req.body.video_id
    },function (err, success) {
        if (err)
            res.status(403).send(err);
        else
            res.json({message: "video deleted"});
    })
});

module.exports = router;