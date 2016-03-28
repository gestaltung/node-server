var mongoose = require('mongoose');

var SignupSchema = new mongoose.Schema({
	email: { type: String, unique: true, lowercase: true },
  ip: String
});

module.exports = mongoose.model('Signup', SignupSchema);