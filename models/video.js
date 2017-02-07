/**
 * Created by tomihei on 17/02/05.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var VideoSchema = new Schema({
    url: {
       type: mongoose.SchemaTypes.Url,
       unique: true,
       maxlength:[100,'Too long']
    },
    user_id: {
        type: String,
        required: [true, 'uuid is required']
    },
    created_at: {
        type: Date
    }
});

VideoSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Video', VideoSchema);