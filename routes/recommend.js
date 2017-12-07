/**
 * Created by tomino on 17/07/29.
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
var elasticsearch = require('es');
var SearchQuery = require('../models/searchquery');

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

router.get('/word',function (req,res,next) {
    SearchQuery.findOne(
        {
            _user: req.userinfo._id
        }, function (err, result) {
            if (err) {
                return res.status(404).send({success: false, msg: 'Data Not Found.'});
            }
            req.result = result;
            next();
        });
});

router.get('/word',function (req,res,next) {
    var wordlist = [];
    // var categoryList = req.result.category
    //     .resuce(function (pre,cur) {
    //         return pre + "OR" + pre;
    //     });
    //
    // req.query = categoryList;

    if(req.result != null){
        wordlist = req.result.word
            .filter(function (x, i, self) {
            return self.indexOf(x) === i;
            })
            .reduce(function (pre,cur){
                return pre + " OR " + cur;
            });
        console.log(wordlist);
        req.esquery = wordlist;
        next();
    }else {
        next();
    }
});


router.get('/word',function (req,res,next) {
    if(req.esquery != null) {
        var page = (req.query.page - 1) * 20;
        es.search({
            query: {
                has_child: {
                    type: "inboards",
                    query: {
                        query_string: {
                            query: req.esquery,
                            fields: ["video_title^3", "video_description", "board_title^2"],
                            default_operator: "AND"
                        }
                    }
                }
            },
            sort: [
                {
                    "created_at": {
                        order: "desc"
                    }
                }
            ],
            size: 20,
            from: page
        }, function (err, data) {
            if (!err) {
                var currentPage = req.query.page;
                var pageCount = data.hits.total > 20 ? (Math.floor(data.hits.total / 20) + 1) : (1);
                var videolist = [];
                if (data.hits.total != 0) {
                    videolist = data.hits.hits.map(function (idx) {
                        return idx._source;
                    });
                }
                res.json(
                    {
                        success: true,
                        currentPage: currentPage,
                        pageCount: pageCount,
                        data: videolist
                    }
                );

            } else {
                res.json({success: false, data: err})
            }
        });
    } else{
        next();
    }
});

router.get('/word',function (req,res,next) {
    Video.paginate({
        video_id: req.params.id,
        createdat
    },{
        select: 'user_id res res_id comment video_id created_at',
        sort:{created_at:-1},
        populate: {path: 'res_id user_id', select: 'user_id name img res res_id comment video_id created_at'},
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
    });
});


module.exports = router;