/**
 * Created by tomihei on 17/02/26.
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

router.get('/',function(req, res, next)  {
	Video.paginate({},
		{
			select: 'url _user title thumbnail favorite',
			sort:{created_at:1},
			populate: {path: '_user', select: '_id name'},
			page: req.query.page,
			limit: req.query.limit
		}, function(err,success) {
			if(err) throw err;
			if(!success) {
				return res.status(404).send({success:false, msg: 'メインページ取得失敗'});
			}else {
				res.json({
					success:true,
					currentPage: success.page,
					pageCount: success.pages,
					itemCount: success.total,
					videos: success.docs
				});
			}
		})
});

module.exports = router;
