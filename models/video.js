/**
 * Created by tomihei on 17/02/05.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');
var mongoosePaginate = require('mongoose-paginate');

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var VideoSchema = new Schema({
    url: {
       type: mongoose.SchemaTypes.Url,
       unique: true,
       maxlength:[100,'URLが長すぎます']
    },
    title: {
        type: String,
    },
    _user: {
        type: Schema.Types.ObjectId,
        required: [true, 'ユーザーIDが必要です'],
        ref: 'User'
    },
    thumbnail: {
        type: mongoose.SchemaTypes.Url,
    },
    favorite: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date
    }
});

VideoSchema.statics.increment = function(id, done) {
    return this.collection.findOneAndUpdate({
        _id: id,
    }, {
        $inc: { favorite: 1 }
    }, {
        new: true,
        upsert: false
    }, function(err, data) {
        done(null, data);
    });
};

VideoSchema.index({created_at: 1});
VideoSchema.index({favorite: 1});
VideoSchema.index({url: 1, _user: 1},{unique: true});

VideoSchema.plugin(uniqueValidator);

VideoSchema.plugin(mongoosePaginate,{message: '登録済みの動画です。'});

module.exports = mongoose.model('Video', VideoSchema);