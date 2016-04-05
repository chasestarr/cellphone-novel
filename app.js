'use strict'
let port = process.env.PORT || 3000;
const express = require('express');
const cons = require('consolidate');
const swig = require('swig');
const phone = require('phone');
const TWILIO_ACCOUNT_SID = require('./config.js').accountSid;
const TWILIO_AUTH_TOKEN = require('./config.js').authToken;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const app = express();

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.get('/', function(req, res){
  res.render('index', {});

  let phoneNumber = req.query.phone;
  if(phoneNumber){
    client.messages.create({
      to: phoneNumber,
      from: '+18133080308',
      body: 'hello world',
    }, function(err, message) {
      console.log(message.sid);
    });
  }
});

app.listen(port, function(){
  console.log('server running on port: ' + port);
});