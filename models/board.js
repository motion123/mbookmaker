/**
 * Created by tomihei on 17/01/24.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');
var bcrypt = require('bcrypt');
var mongoosePaginate = require('mongoose-paginate');

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var BoardSchema = new Schema({
   _user: {
       type: Schema.Types.ObjectId,
       ref: 'User',
       required: [true, 'uuid is required']
   },
    user_id: {
        type: String,
    },
    title: {
        type: String,
        maxlength: [50, 'Too long'],
        required: [true, 'タイトルを入力してください']
   },
    description: {
        type: String,
        maxlength:[1000, '説明文が長すぎです']
   },
   secret: {
        type: Boolean,
        default: false
   },
    categoly: {
        type: Number,
        min: 0,
        max: 35
   },
    count: {
        type: Number,
        default: 0,
    },
    img: {
       type: mongoose.SchemaTypes.Url,
    }
},
    {
        timestamps:
            {
                createdAt: 'created_at' ,
                updatedAt: 'updated_at'
            }
    }
);

BoardSchema.statics.update = function(id,url, done) {
    console.log(url);
    return this.collection.findOneAndUpdate({
        _id: id,
    }, {
        $set: { img: url },
    }, {
        new: true,
        upsert: false
    }, function(err, data) {
        done(err, data);
    });
};


BoardSchema.statics.increment = function(id,done) {
    return this.collection.findOneAndUpdate({
        _id: id,
    }, {
        $inc: { count: 1 },
    }, {
        new: true,
        upsert: false
    }, function(err, data) {
        done(null, data);
    });
};

BoardSchema.statics.decrement = function(id,done) {
    return this.collection.findOneAndUpdate({
        _id: id,
    }, {
        $inc: { count: -1 },
    }, {
        new: true,
        upsert: false
    }, function(err, data) {
        done(null, data);
    });
};


BoardSchema.index({_user:1});
BoardSchema.index({created_at: -1});
BoardSchema.index({updated_at: -1});
BoardSchema.index({count: -1});

BoardSchema.plugin(uniqueValidator);
BoardSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Board', BoardSchema);
