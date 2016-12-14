var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
  category: {type: Schema.Types.ObjectId, ref: 'Category'},
  question: {type: String, unique: true},
  like: Number,
  dislike: Number,
  postedBy: {type: Schema.Types.ObjectId, ref:'User'},
  dateCreated: Date,
  comments: [{body: String,
    by: mongoose.Schema.Types.ObjectId
  }],
  topics: String
});

module.exports = mongoose.model('Question', questionSchema);
