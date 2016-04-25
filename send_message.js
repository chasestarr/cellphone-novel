'use strict'
const TWILIO_ACCOUNT_SID = require('./config.js').TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = require('./config.js').TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = require('./config.js').TWILIO_PHONE_NUMBER;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

module.exports = function(userId, entry, cb){
  client.messages.create({
    to: userId,
    from: TWILIO_PHONE_NUMBER,
    body: entry.text,
  }, function(e, message) {
    console.log('message to ', message.to, ' successful');
    let nextEntry = entry.entryId + 1;
    cb(userId, nextEntry);
  });
};

