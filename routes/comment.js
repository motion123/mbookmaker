/**
 * Created by tomihei on 17/04/04.
 */
var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var config = require('../config/database'); // get db config file
var User = require('../models/user');
var passport = require('passport');
require('../config/passport')(passport);
var bcrypt = require('bcrypt');
var getToken = require('./cont/token');
var paginate = require('express-paginate');
var Comment = require('../models/comment');
var Video = require('../models/video');

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



router.post('/new', function(req, res,next) {
	Video.findOne({
		_id: req.body.video_id
	},function (err, video) {
		if(err) {
			return res.status(403).send({success: false, error: err})
		} else if(!video) {
			return res.status(404).send({success:false, msg: 'video Not Found,'})
		} else{
			next();
		}
	})

});


router.post('/new', function(req, res) {
	var comment = new Comment();
	comment.user_id = req.userinfo._id;
	comment.comment = req.body.comment;
	comment.video_id = req.body.video_id;
	comment.res = req.body.res ? req.body.res : false;
	comment.save(function(err,success) {
		if (err) {
			res.json({success:false,error: err});
		} else if(success){
			Comment.update(req.body.res_id,success._id,function(err, result){
				console.log(err);
				console.log(result);
				if(!err){
					res.json({success: true, data:success});
				}
			});
		}
	})
});

router.get('/:id', function(req,res) {
	Comment.paginate({
		video_id: req.params.id,
		res: false,
	},{
		select: 'user_id res res_id comment video_id created_at',
		sort:{created_at:-1},
		populate: {path: 'user_id res_id', select: 'user_id name img res res_id comment video_id created_at'},
		page: req.query.page,
		limit: 10,
	},function(err,success){
		if(err){
			return res.status(404).send({success:false, msg: 'comment取得失敗'});
		} else if(!success) {
			return res.status(404).send({success:false, msg: 'comment取得失敗'});
		}else {
			res.json({
				success:true,
				currentPage: success.page,
				pageCount: success.pages,
				itemCount: success.total,
				comments: success.docs
			});
		}
	})
});

router.delete('/:id',function (req,res) {
	Comment.remove({
		user_id: req.userinfo._id,
		_id: req.params.id,
	},function(err,success){
		if(err){
			res.json({success:false,error: err});
		} else if (success){
			res.json({success: true, data: success});
		}
	})
});

module.exports = router;
