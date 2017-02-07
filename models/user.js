/**
 * Created by tomihei on 17/01/16.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');
var bcrypt = require('bcrypt');

var uniqueValidator = require('mongoose-unique-validator');

var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        minlength: [2, 'Too short'],
        maxlength: [15, 'Too long'],
        required: [true, 'name is required']
    },
    user_email: {
        type: mongoose.SchemaTypes.Email,
        minlength: [6, 'Too short'],
        maxlength: [100, 'Too long'],
        required: [true, 'id is required'],
        unique: true
    },
    user_password: {
        type: String,
        minlength: [8, 'Too short'],
        required: [true, 'password is required']
    },
    created_at: {
        type: Date
    },
    img: {
        type: mongoose.SchemaTypes.Url
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

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

UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', UserSchema);
