/**
 * Created by tomihei on 17/04/04.
 */
var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var config = require('../config/database'); // get db config file
var User = require('../models/user');
var Follow = require('../models/follow');
var passport = require('passport');
require('../config/passport')(passport);
var bcrypt = require('bcrypt');
var getToken = require('./cont/token');
var paginate = require('express-paginate');
var Board = require('../models/board');

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
	Board.findOne({
		_id: req.body.board_id,
		_user: req.body.user_id
	},function (err, user) {
		if(err) {
			return res.status(403).send({success: false, error: err})
		} else if(!user) {
			return res.status(404).send({success:false, msg: 'follower Not Found,'})
		} else{
			next();
		}
	})

});


router.post('/new', function(req, res) {
	var follow = new Follow();
	follow.followee = req.body.user_id;
	follow.follower = req.userinfo._id;
	follow.follow_board = req.body.board_id;

	follow.save(function(err,success) {
		if (err) {
			res.status(403).send({success:false,error: err});
		} else if(success){
			res.json({success: true,board: success.follow_board});
		}
	})
});


router.get('/er/:id', function(req,res) {
	Follow.find({followee: req.params.id})
		.distinct("follower", (err,ids)=>{
			User.paginate({'_id':{$in : ids}},{
				select:'_id name img title user_id',
				page: req.query.page,
				limit: req.query.limit
			},function (err,success) {
				if(err){
					return res.status(404).send({success:false, msg: 'follower取得失敗'});
				} else if(!success) {
					return res.status(404).send({success: false, msg: 'follower取得失敗'});
				}else {
					res.json({
						success: true,
						currentPage: success.page,
						pageCount: success.pages,
						itemCount: success.total,
						followdata: success.docs
					});
				}
			})
		})
});


router.get('/ee/:id', function (req,res) {
	Follow.find({follower: req.params.id})
		.distinct("followee", (err,ids)=>{
			User.paginate({'_id':{$in : ids}},{
				select:'_id name img title user_id',
				page: req.query.page,
				limit: req.query.limit
			},function (err,success) {
				if(err){
					return res.status(404).send({success:false, msg: 'followee取得失敗'});
				} else if(!success) {
					return res.status(404).send({success: false, msg: 'followee取得失敗'});
				}else {
					res.json({
						success: true,
						currentPage: success.page,
						pageCount: success.pages,
						itemCount: success.total,
						followdata: success.docs
					});
				}
			});
	});
	// Follow.paginate({
	// 	follower: req.params.id
	// },{
	// 	select: 'followee follow_board',
	// 	sort:{created_at:1},
	// 	populate: {path: 'followee follow_board', select: '_id name img title user_id'},
	// 	page: req.query.page,
	// 	limit: req.query.limit
	// },function(err,success){
	// 	if(err){
	// 		return res.status(404).send({success:false, msg: 'followee取得失敗'});
	// 	} else if(!success) {
	// 		return res.status(404).send({success:false, msg: 'followee取得失敗'});
	// 	}else {
	// 		res.json({
	// 			success:true,
	// 			currentPage: success.page,
	// 			pageCount: success.pages,
	// 			itemCount: success.total,
	// 			followdata: success.docs
	// 		});
	// 	}
	// })
});

router.get('/board/:id', function (req,res) {
	Follow.paginate({
		follow_board: req.params.id
	},{
		select: 'follow_board follower',
		sort:{created_at:1},
		populate: {path: 'follow_board follower', select: '_id name img title user_id'},
		page: req.query.page,
		limit: req.query.limit
	},function(err,success){
		if(err){
			return res.status(404).send({success:false, msg: 'followee取得失敗'});
		} else if(!success) {
			return res.status(404).send({success:false, msg: 'followee取得失敗'});
		}else {
			res.json({
				success:true,
				currentPage: success.page,
				pageCount: success.pages,
				itemCount: success.total,
				followdata: success.docs
			});
		}
	})
});

router.get('/er/board/:id',function (req,res) {
	Follow.findOne({
		follower: req.userinfo._id,
		follow_board: req.params.id
	},function(err,success){
		if(err){ throw err}
		if(!success){
			res.json({success: false, message:"ボードがフォローされていません"})
		}else{
			res.json({
				success:true,
				follow_board:success.follow_board,
				message:"フォローされています"
			})
		}
	})
});

router.get('/er/user/:id',function (req,res) {
	Follow.findOne({
		follower: req.userinfo._id,
		followee: req.params.id
	},function(err,success){
		if(err){ throw err}
		if(!success){
			res.json({success: false, message:"ユーザーがフォローされていません"})
		}else{
			res.json({
				success:true,
				followee: success.followee,
				message:"フォローされています"
			})
		}
	})
});

router.delete('/board/:id',function (req,res) {
	Follow.remove({
		follower: req.userinfo._id,
		follow_board: req.params.id
	},function(err,success){
		if(err){
			res.json({success:false,error: err});
		} else if (success){
			res.json({success: true})
		}
	})
});

router.delete('/user/:id',function (req,res) {
	Follow.remove({
		follower: req.userinfo._id,
		followee: req.params.id
	},function(err,success){
		if(err){
			res.json({success:false,error: err});
		} else if (success){
			res.json({success: true})
		}
	})
});

module.exports = router;
