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
    var pattern = "YOUTUBE"; //修正
    Video.findOne({
        url_id: req.body.url_id,
        pattern: pattern
    },function (err, video){
        if(err) throw err;
        if(!video) {
            // URL をパースする方法を考える
            newVideo.url_id = req.body.url_id;
            // pattern を取得する方法を考える
            newVideo.pattern = pattern;
            newVideo.url = req.body.url;
            newVideo._user = req.userinfo._id;
            newVideo.title = req.body.title;
            newVideo.thumbnail = req.body.thumbnail;

            newVideo.save(function (err,success) {
                if(err) {
                    res.status(403).send(err);
                } else {
                    req.videoinfo = success;
                    next();
                }
            });
        } else {
            req.videoinfo = video;
            next();
        }
    })
});

router.post('/new', function (req,res) {
    Board.findOne({
        _user: req.userinfo._id,
        _id: req.body.board_id
    },function(err,board) {
        if(err) throw err;
        if(!board) {
            return res.status(403).send({success: false, msg: 'Authentication failed. Board not found.'});
        } else {
            var inboard = new InBoard();

            inboard._user = req.userinfo._id;
            inboard.user_name = req.userinfo.name;
            inboard.board_id = req.body.board_id;
            inboard.board_title = board.title;
            inboard.video_id = req.videoinfo._id;
            inboard.url_id = req.videoinfo.url_id;
            inboard.video_title = req.body.video_title;
            inboard.video_description = req.body.video_description ? req.body.video_description : "";

            inboard.save(function (err, success) {
                if (err)
                    res.status(403).send(err);
                else
                    Board.update(success.board_id,function (err,result) {
                       console.log(result);//修正
                    });
                    Video.increment(req.videoinfo._id,function(err, result) {
                        console.log(result);
                    });
                    res.status(200).send(success);
            })
        }
    })
});

router.get('/:id', function (req,res) {
   Video.findOne({_id: req.params.id})
       .populate({path: '_user', select: '_id name img'})
       .exec(function (err, success){
        if(err) throw err;　
        if(!success) {
            return res.status(404).send({success: false, msg: 'Video not found'});
        } else {
            res.json({
                success: true,
                data:success
            });
        }
       })
});

router.get('/:id/info', function(req,res){
   InBoard.paginate({
       video_id: req.params.id,
   }, {
        select: '_user board_id board_title created_at',
        sort: { created_at: 1},
        populate: {path: '_user', select: '_id name'},
        page: req.query.page,
        limit: req.query.limit
   }, function(err, success) {
       if(err) return res.status(403).send(err);
       if(success.total == 0) {
           return res.status(404).send({success: false, msg: 'Video not found'});
       } else {
           res.json({
               success: true,
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
      _user: req.userinfo._id,
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