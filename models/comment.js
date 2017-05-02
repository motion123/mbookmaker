/**
 * Created by tomihei on 17/04/04.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
var mongoosePaginate = require('mongoose-paginate');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
		user_id: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'ユーザーIDがありません']
		},
		comment:{
			type: String,
			minlength:[2, 'コメントが短すぎます'],
			maxlength:[3000, 'コメントが長すぎです'],
			required:[true, 'コメントが入力されていません'],
        },
		video_id: {
			type: Schema.Types.ObjectId,
			ref: 'Video',
			required: [true, 'ビデオIDがありません'],
		},
		res: {
			type: Boolean,
			default: false,
		},
		res_id: [{
			type: Schema.Types.ObjectId,
			ref: 'Comment',
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

CommentSchema.statics.update = function(id,resId, done) {
	return this.findOneAndUpdate({
		_id: id,
	}, {
		$push: { res_id: resId },
	}, {
		safe: true,
		new: true,
		upsert: false
	}, function(err, data) {
		done(err, data);
	});
};

CommentSchema.index({video_id:1, created_at: -1});
CommentSchema.index({_user:1, video_id:1});
CommentSchema.index({created_at: -1});

CommentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Comment', CommentSchema);
