/**
 * Created by tomino on 17/07/27.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;



var SearchQuerySchema = new Schema({
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'ユーザーIDがありません']
        },
        word: [{
            type:String,
        }],
        category: [{
            type:String,
        }]
    },
    {
        timestamps:
            {
                createdAt: 'created_at' ,
                updatedAt: 'updated_at'
            }
    }
);

SearchQuerySchema.statics.push = function(id, word, done) {
    return this.findOneAndUpdate({
        _user: id,
    }, {
        $push: { word: word },
    }, {
        safe: true,
        new: true,
        upsert: true
    }, function(err, data) {
        done(err, data);
    });
};

SearchQuerySchema.statics.pop = function(id, done) {
    return this.findOneAndUpdate({
        _user: id,
    }, {
        $pop: { word: -1 },
    }, {
        safe: true,
    }, function(err, data) {
        done(err, data);
    });
};

SearchQuerySchema.index({_user:1});
SearchQuerySchema.index({created_at: -1});


module.exports = mongoose.model('SearchQuery', SearchQuerySchema);