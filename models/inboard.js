/**
 * Created by tomihei on 17/02/05.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
var mongoosePaginate = require('mongoose-paginate');
var bcrypt = require('bcrypt');


var Schema = mongoose.Schema;

var InBoardSchema = new Schema({
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'ユーザーIDがありません']
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
        url_id: {
            type: String,
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

InBoardSchema.index({board_id: 1, video_id:1});
InBoardSchema.index({_user:1, board_id:1});
InBoardSchema.index({created_at: -1});

InBoardSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('InBoard', InBoardSchema);
