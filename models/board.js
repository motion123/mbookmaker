/**
 * Created by tomihei on 17/01/24.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');
var bcrypt = require('bcrypt');

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var BoardSchema = new Schema({
   user_id: {
       type: String,
       required: [true, 'uuid is required']
   },
    title: {
        type: String,
        maxlength: [50, 'Too long'],
        required: [true, 'borde title is required']
   },
    description: {
        type: String,
        maxlength:[1000, 'Too long']
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
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

BoardSchema.plugin(uniqueValidator);


module.exports = mongoose.model('Board', BoardSchema);
