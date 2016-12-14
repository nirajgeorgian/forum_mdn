var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;


// User Schema attributes
var UserSchema = new Schema({
  firstname: {type:String, lowercase: true},
  lastname: {type: String, lowercase: true},
  // username: {type: String, unique: true, lowercase: true},
  // profilePicture: {type: String, default: ''},
  email: {type: String, unique: true, lowercase:true},
  profile: {
    picture: String,
    name: {type: String, unique: true, lowercase: true}
  },
  password: String,
  salt: String,
  topics: {type: String, lowercase: true},
  website: {type: String, lowercase: true, default: ''},
  confirmationCode: String,
  resetPasswordToken: String,
  resetPasswordDate: Date,
  resetPasswordExpires: Date,
  address: String
});

// Hash the password before saving to the database
UserSchema.pre('save', function(next) {
  var user = this;
  if(!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Compare password between user typedin and the database password
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.gravatar = function(size) {
  if (!this.size) size = 300;
  if(!this.email) return 'https://gravatar.com/avatar/?s' +  size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}

module.exports = mongoose.model('User', UserSchema);
