'use strict'
let port = process.env.PORT || 3000;
const express = require('express');
const cons = require('consolidate');
const swig = require('swig');
const phone = require('phone');
const TWILIO_ACCOUNT_SID = require('./config.js').TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = require('./config.js').TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = require('./config.js').TWILIO_PHONE_NUMBER;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const app = express();

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.get('/', function(req, res){
  res.render('index', {});

  let phoneNumber = phone(req.query.phone)[0];
  if(phoneNumber){
    client.messages.create({
      to: phone(phoneNumber)[0],
      from: TWILIO_PHONE_NUMBER,
      body: 'Hay Boo ;)',
    }, function(err, message) {
      console.log(message.sid);
    });
  }
});

app.listen(port, function(){
  console.log('server running on port: ' + port);
});