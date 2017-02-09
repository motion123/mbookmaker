/**
 * Created by tomihei on 17/02/05.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');
var mongoosePaginate = require('mongoose-paginate');
var bcrypt = require('bcrypt');


var Schema = mongoose.Schema;

var InBoardSchema = new Schema({
        user_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'user_id is required']
        },
        user_name: {
            type: String
        },
        board_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'board_id is required']
        },
        board_title:{
            type: String
        },
        video_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'video_id is required']
        },
        url: {
            type: mongoose.SchemaTypes.Url,
            maxlength:[100,'Too long']
        },
        video_title: {
            type:String,
            required: [true, 'title is required'],
            maxlength:[100, 'title is too long']
        },
        video_description:{
            type:String,
            maxlength:[3000, 'description is too long']
        },
        created_at: {
            type: Date
        }
});

InBoardSchema.index({board_id: 1, video_id:1});
InBoardSchema.index({user_id:1, board_id:1});

InBoardSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('InBoard', InBoardSchema);
