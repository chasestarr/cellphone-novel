'use strict'

module.exports = function(mongoose){
  let userSchema = mongoose.Schema({
    userId: Number,
    currentEntry: Number,
    active: Boolean
  });

  return mongoose.model('users', userSchema);
};