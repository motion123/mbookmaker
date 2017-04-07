var config = require('../../config/database'); // get db config file
var User = require('../../models/user');
var passport = require('passport');
require('../../config/passport')(passport);
var Video = require('../../models/video');
var Board = require('../../models/board');
var InBoard = require('../../models/inboard');
var Comment = require('../../models/comment');
var Follow = require('../../models/follow');

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



testUser = new User();

testUser.name = "tomihei";
testUser.user_email = "testpass@gmail.com";
testUser.user_password = "testpass";
testUser.user_id = "test_user";
testUser.save(function(err,success){
    if(err) console.log(err);
    if(success){
        BoardData(success);

    }
});


function FollowData(success,board) {
    var follow = new Follow();
    follow.followee = board._user;
    follow.follower = success._id;
    follow.follow_board = board._id;

    follow.save(function (err) {
        if(err) console.log(err);
    })
}



function BoardData(success){
    for(var i= 0;i <= 50; i++) {
        var board = new Board();

        board._user = success._id;
        board.user_id = success.user_id;
        board.title= "test_name" + i;
        board.user_email= "test" + i + "@test.com";
        board.user_password = "tese_password" + i;

        board.save(function(err,success){
            var board = success;
            if(err) console.log(err);
            var user = new User();

            user.name = success.title;
            user.user_email = success.user_email;
            user.user_id = "test" + + Math.floor( Math.random() * 99999999 );
            user.user_password = success.user_password;


            user.save(function (err, success) {
                if (err) console.log(err);
                if (success) {
                    FollowData(success,board);
                    VideoData(board,success);
                }
            });
        });
    }
}



function VideoData(board,user){
    var boarddata = board;
    var userData = user;
    for(var i= 0;i <= 50; i++) {
        var video = new Video();

        video._user = boarddata._user;
        video.url_id = "j0h2u87JwyA&" + Math.floor( Math.random() * 99999999 );
        video.url = "https://www.youtube.com/watch?v=j0h2u87JwyA";
        video.pattern = "YOUTUBE";
        video.title = "test" + i;
        video.thumbnail = "http://i.ytimg.com/vi/N7OPZOBJZyI/mqdefault.jpg";
        video.favorite = i;
        video.save(function(err,ok){
            if(err) console.log(err);
            if(ok) {
                CommentData(userData,ok);
                InBoardData(ok,boarddata);
            }
        });
    }
}

function CommentData(user,video){
    var comment = new Comment();
    comment.video_id = video._id;
    comment.comment = "moimoimoimoimoimoimoimoi";
    comment.user_id = user._id;
    comment.save(function (err) {
        if(err) console.log(err);
    })
}

function InBoardData(success,boarddata) {
    var inboard = new InBoard();
    User.findOne({
        _id: success._user
    }, function (err, ok) {
        if (err) throw err;
        for(var i=0; i <= 25; i++) {
            inboard._user = success._user;
            inboard.user_name = ok.name;
            inboard.board_id = boarddata._id;
            inboard.board_title = boarddata.title;
            inboard.video_id = success._id;
            inboard.url_id = success.url_id;
            inboard.video_title = "test" + Math.floor(Math.random() * 99999999);
            inboard.video_description = "test";
            inboard.thumbnail = success.thumbnail;
            inboard.pattern = success.pattern;
            inboard.save(function (err,ok) {
                if (err) {
                    console.log(err);
                }else {
                    Board.update(ok.board_id, success.thumbnail, function (err, result) {
                    });
                    Board.increment(ok.board_id, function (err, result) {
                    });
                    Video.increment(ok.video_id, function (err, result) {
                    });
                }
            });
        }
    });

}