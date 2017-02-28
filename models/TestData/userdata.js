var config = require('../../config/database'); // get db config file
var User = require('../../models/user');
var passport = require('passport');
require('../../config/passport')(passport);
var Video = require('../../models/video');
var Board = require('../../models/board');
var InBoard = require('../../models/inboard');

/* GET users listing. */

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/jsonAPI');

User.remove({},function(err){
    if(err) console.log(err);
});

Video.remove({},function(err){
    console.log(err);
});

Board.remove({},function(err){
    console.log(err);
});

InBoard.remove({},function(err){
    console.log(err);
});



for(var i= 0;i <= 100; i++) {
    var user = new User();

    user.name= "test_name" + i;
    user.user_email= "test" + i + "@test.com";
    user.user_password = "tese_password" + i;
    user.created_at = Date.now();

    user.save(function(err,success){
        if(err) console.log(err);
    });
}

testUser = new User();

testUser.name = "テストユーザ";
testUser.user_email = "testpass@gmail.com";
testUser.user_password = "testpass";
testUser.created_at = Date.now();

testUser.save(function(err,success){
    if(err) console.log(err);
    if(success){
        BoardData(success);
    }
});

console.log("Test User Data Inserted");

function BoardData(success){
    for(var i= 0;i <= 100; i++) {
        var board = new Board();

        board._user = success._id;
        board.title= "test_name" + i;
        board.user_email= "test" + i + "@test.com";
        board.user_password = "tese_password" + i;
        board.created_at = Date.now();

        board.save(function(err,success){
            if(err) console.log(err);
            if(success) VideoData(success);
        });
    }
}



function VideoData(success){
    var boarddata = success;
    for(var i= 0;i <= 100; i++) {
        var video = new Video();

        video._user = boarddata._user;
        video.url = "https://www.youtube.com/watch?v=N7OPZOBJZyI&" + Math.floor( Math.random() * 99999999 );
        video.created_at = Date.now();
        video.title = "test" + i;
        video.thumbnail = "https://i.ytimg.com/vi/kdm5Gb0soAU/hqdefault.jpg?" + i;
        video.favorite = i;
        video.save(function(err,ok){
            if(err) console.log(err);
            if(ok) InBoardData(ok,boarddata);
        });
    }
    console.log("VideoData Inserted");
}

function InBoardData(success,boarddata) {
    var inboard = new InBoard();
    User.findOne({
        _id: success._user
    }, function (err, ok) {
        if (err) throw err;
        for(var i=0; i <= 30; i++) {
            console.log(success._id);
            inboard.user_id = success._user;
            inboard.user_name = ok.name;
            inboard.board_id = boarddata._id;
            inboard.board_title = boarddata.title;
            inboard.video_id = success._id;
            inboard.url = success.url;
            inboard.video_title = "test" + Math.floor(Math.random() * 99999999);
            inboard.video_description = "test";
            inboard.created_at = Date.now();

            inboard.save(function (err) {
                if (err) console.log(err);
            });
        }
    });

    console.log("Test Inboard Data Inserted");
}