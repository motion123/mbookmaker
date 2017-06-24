/**
 * Created by tomihei on 17/06/12.
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
var elasticsearch = require('es');

var config1 = {
	_index: 'video',
	_type:'videos'
};
es = elasticsearch(config1);

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

router.get('/video/:word',function (req,res,next) {
	es.search({
		query: {
			has_child: {
				type: "inboards",
				query: {
					query_string: {
						query: req.params.word,
						fields: ["video_title^3", "video_description", "board_title^2"],
						default_operator: "AND"
					}
				}
			}
			},
			sort:[
				{
					"created_at": {
						order: "desc"
					}
				}
			],
			size: 20,
			from: req.query.page - 1
	}, function (err, data) {
		if(!err) {
			var currentPage = req.query.page;
			var pageCount = data.hits.total > 20 ? (Math.floor(data.hits.total / 20) + 1) :(1);
			res.json(
				{
					success:true,
					currentPage:currentPage,
					pageCount: pageCount,
					data: data.hits.hits
				}
				);
		}else {
			res.json({success:false, data:err})
		}
	});
});

module.exports = router;