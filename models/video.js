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
    url_id: {
        type: String,
        unique: true,
        maxlength:[100,'URLが長すぎます']

    },
    url: {
        type: mongoose.SchemaTypes.Url,
        maxlength:[100,'URLが長すぎます']
    },
    pattern:{
        type: String,
    },
    title: {
        type: String,
        required: [true, 'タイトルを入力してください'],
        maxlength:[100, 'タイトルが長すぎです'],
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

VideoSchema.statics.increment = function(id, done) {
    return this.collection.findOneAndUpdate({
        _id: id,
    }, {
        $inc: { favorite: 1 },
    }, {
        new: true,
        upsert: false
    }, function(err, data) {
        done(null, data);
    });
};

VideoSchema.index({created_at: -1});
VideoSchema.index({favorite: -1});
VideoSchema.index({url_id: 1, _user: 1},{unique: true});
VideoSchema.index({_user: 1});

VideoSchema.plugin(uniqueValidator);

VideoSchema.plugin(mongoosePaginate,{message: '登録済みの動画です。'});

module.exports = mongoose.model('Video', VideoSchema);