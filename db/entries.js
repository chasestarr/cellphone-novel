'use strict'

module.exports = function(mongoose){
  let entrySchema = mongoose.Schema({
    entryId: Number,
    text: String,
    delay: {days: Number, hour: Number, minute: Number}
  });

  return mongoose.model('entries', entrySchema);
};