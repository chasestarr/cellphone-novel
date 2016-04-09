'use strict'

module.exports = function(mongoose){
  let userSchema = mongoose.Schema({
    userNumber: Number,
    currentEntry: Number,
    active: Boolean
  });

  return mongoose.model('users', userSchema);
};