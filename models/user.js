/**
 * Created by tomihei on 17/01/16.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');
var bcrypt = require('bcrypt');
var mongoosePaginate = require('mongoose-paginate');

var uniqueValidator = require('mongoose-unique-validator');

var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        minlength: [2, '名前が短すぎます'],
        maxlength: [15, '名前が長すぎです'],
        required: [true, '名前が入力されていません']
    },
    user_id: {
        type:String,
        minlength: [2, 'idが短すぎます'],
        maxlength: [15, 'idが長すぎです'],
        required: [true, 'idが入力されていません'],
        unique: true,
        lowercase: true
    },
    user_email: {
        type: mongoose.SchemaTypes.Email,
        minlength: [6, 'メールアドレスが短すぎます'],
        maxlength: [100, 'メールアドレスが長すぎです'],
        required: [true, 'メールアドレスが入力されていません'],
        unique: true
    },
    user_password: {
        type: String,
        minlength: [8, 'パスワードが短すぎます'],
        maxlength: [100, 'パスワードが長すぎます'],
        required: [true, 'パスワードが入力されていません']
    },
    img: {
        type: mongoose.SchemaTypes.Url
    },
    video: {
        type:Schema.Types.ObjectId, ref: 'Video'
    },
    board: {
        type:Schema.Types.ObjectId, ref: 'Board'
    },
    inboard: {
        type:Schema.Types.ObjectId, ref: 'InBoard'
    },
	follow: {
		type:Schema.Types.ObjectId, ref: 'Follow'
	},
	comment: {
		type:Schema.Types.ObjectId, ref: 'Comment'
	},
},
    {
        timestamps:
            {
                createdAt: 'created_at' ,
                updatedAt: 'updated_at'
            }
    }
);

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('user_password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.user_password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.user_password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.user_password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

UserSchema.plugin(uniqueValidator,{message: "登録済みのメールアドレスです"});
UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema);
