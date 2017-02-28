/**
 * Created by tomihei on 17/02/25.
 */
var config = require('../../config/database'); // get db config file
var User = require('../../models/user');
var passport = require('passport');
require('../../config/passport')(passport);
var Video = require('../../models/video');
var Board = require('../../models/board');
var InBoard = require('../../models/inboard');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/jsonAPI');

Video.findOne({title: "test43"})
	.populate('_user')
	.exec((err,story) =>{
		console.log(story);
	});
