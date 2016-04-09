'use strict'

module.exports = function(mongoose){
  let entrySchema = mongoose.Schema({
    entryId: Number,
    text: String,
    delay: Number
  });

  return mongoose.model('entries', entrySchema);
};