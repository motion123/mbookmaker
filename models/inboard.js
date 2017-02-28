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
            required: [true, 'ユーザーIDがありません']
        },
        user_name: {
            type: String
        },
        board_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'ボードIDがありません']
        },
        board_title:{
            type: String
        },
        video_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'ビデオIDがありません']
        },
        url: {
            type: mongoose.SchemaTypes.Url,
            maxlength:[100,'URLが長すぎです']
        },
        video_title: {
            type:String,
            required: [true, 'タイトルを入力してください'],
            maxlength:[100, 'タイトルが長すぎです']
        },
        video_description:{
            type:String,
            maxlength:[3000, '説明文が長すぎです']
        },
        created_at: {
            type: Date
        }
});

InBoardSchema.index({board_id: 1, video_id:1});
InBoardSchema.index({user_id:1, board_id:1});
InBoardSchema.index({created_at: 1});

InBoardSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('InBoard', InBoardSchema);
