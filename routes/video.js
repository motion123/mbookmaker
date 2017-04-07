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
var urlParser = require('../url/urlparse');
var thumbnailCreator = require('../thumbnail/selector');


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
        url_id: req.body.url_id,
        pattern: req.body.pattern,
    },function (err, video){
        if(err) {
            return res.status(400).send({success: false, msg: "MongoError" , error: err });
        }
        if(!video) {
            newVideo.url_id = req.body.url_id;
            newVideo.pattern = req.body.pattern;
            newVideo.url = req.body.url;
            newVideo._user = req.userinfo._id;
            newVideo.title = req.body.title;
            newVideo.thumbnail = req.body.thumbnail;

            newVideo.save(function (err,success) {
                if(err) {
                    res.status(400).send({success: false, validError: true,error:err});
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
        if(!board) {
            return res.status(400).send({success: false, error: {errors: { board: err}},boardIdNotExist:true, msg: 'Board not found.'});
        } else {
            var inboard = new InBoard();

            inboard._user = req.userinfo._id;
            inboard.user_id = req.userinfo.user_id;
            inboard.user_name = req.userinfo.name;
            inboard.board_id = board._id;
            inboard.board_title = board.title;
            inboard.video_id = req.videoinfo._id;
            inboard.url_id = req.videoinfo.url_id;
            inboard.video_title = req.body.title;
            inboard.video_description = req.body.description ? req.body.description : "";
            inboard.thumbnail = req.videoinfo.thumbnail;
            inboard.pattern = req.videoinfo.pattern;

            inboard.save(function (err, success) {
                if (err) {
                    res.status(400).send({success: false, validError:true, error: err});
                } else {
                    Board.update(success.board_id, success.thumbnail, function (err, result) {
                        console.log(result);//修正
                    });
                    Board.increment(success.board_id, function (err, result) {
                        console.log(result);
                    });
                    Video.increment(success.video_id, function (err, result) {
                        console.log(result);
                    });
                    res.json({
                        success: true,
                        video: success,
                    });
                }
            })
        }
    })
});

router.get('/parse/:url',function(req,res,next) {
    var mediaurl = decodeURIComponent(req.params.url);
    req.mediaurl = mediaurl;
    urlParser(mediaurl, function(err,params){
        if(err){
            return res.status(400).send({success: false, msg: 'URL Validation Error'});
        } else {
            req.urlinfo = params;
            next();
        }
    })
});

router.get('/parse/:url',function(req,res) {
    thumbnailCreator(req.urlinfo.pattern,req.urlinfo.id, function(err,url){
        if(err) {
            return res.status(400).send({success: false, msg: 'thumbnail not found'});
        }else {
            res.json({
                success:true,
                url_id:req.urlinfo.id,
                pattern: req.urlinfo.pattern,
                thumbnail: url,
                url:req.mediaurl,
            })
        }
    })
});

router.get('/:id', function (req,res) {
   Video.findOne({_id: req.params.id})
       .populate({path: '_user', select: '_id name img user_id'})
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

router.delete('/:id/delete',function(req,res,next) {
    InBoard.findOne({
        _user: req.userinfo._id,
        _id: req.params.id,
    }, function (err, success) {
        if (err) {
            res.status(403).json({success: false, error: err});
        }else if(success) {
            req.boardinfo = success;
            next();
        } else {
            res.status(403).json({success: false, message: "Not Found"});
        }
    });

});

router.delete('/:id/delete',function(req,res) {
    InBoard.remove({
      _user: req.userinfo._id,
      _id: req.params.id,
    },function (err, success) {
        if (err)
            res.status(403).json({success:false,error:err});
        else if(success)
            Board.decrement(req.boardinfo.board_id, function (err, result) {
                console.log(result);
            });
            res.json({
                success:true,
                message: "video deleted",
                video: {
                    video_title: req.boardinfo.video_title,
                    board_title: req.boardinfo.board_title,
                }
            });

    })
});

module.exports = router;