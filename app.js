'use strict'
let port = process.env.PORT || 3000;
const express = require('express');
const cons = require('consolidate');
const swig = require('swig');
const phone = require('phone');
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);
const app = express();

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.get('/', function(req, res){
  res.render('index', {});
  if(req.query.phone){
    console.log(phone(req.query.phone)[0]);
  }
});

app.listen(port, function(){
  console.log('server running on port: ' + port);
});