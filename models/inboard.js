/**
 * Created by tomihei on 17/02/05.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');
var bcrypt = require('bcrypt');

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var InBoardSchema = new Schema({
        user_id: {
            type: String,
            required: [true, 'user_id is required']
        },
        board_id: {
            type: String,
            required: [true, 'board_id is required']
        },
        video_id: {
            type: String,
            required: [true, 'video_id is required']
        },
        created_at: {
            type: Date
        }
});


InBoardSchema.plugin(uniqueValidator);


module.exports = mongoose.model('InBoard', InBoardSchema);
