'use strict'
let port = process.env.PORT || 3000;
const dbConn = process.env.DBCONN || "mongodb://localhost/cellphone-novel";
const express = require('express');
const cons = require('consolidate');
const swig = require('swig');
const phone = require('phone');
const mongoose = require('mongoose');
const schema = require('./db/databaseSchema');
const TWILIO_ACCOUNT_SID = require('./config.js').TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = require('./config.js').TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = require('./config.js').TWILIO_PHONE_NUMBER;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const app = express();

const SECOND = 1000;

mongoose.connect(dbConn);
const db = mongoose.connection;

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.get('/', function(req, res){
  res.render('index', {});

  // let phoneNumber = phone(req.query.phone)[0];
  // if(phoneNumber){
  //   client.messages.create({
  //     to: phone(phoneNumber)[0],
  //     from: TWILIO_PHONE_NUMBER,
  //     body: 'Hay Boo ;)',
  //   }, function(err, message) {
  //     console.log(message.sid);
  //   });
  // }

  let phoneNumber = phone(req.query.phone)[0];
  if(phoneNumber) addUser(phoneNumber);
});

app.listen(port, function(){
  console.log('server running on port: ' + port);
});

function addUser(u){
  return new Promise((resolve, reject) => {
    let User = schema.users;
    User.findOne({userNumber: u}, (e, user) => {
      if(e) reject(e);
      if(!user){
        let userItem = User({userNumber: u, currentEntry: 0, active: true});
        userItem.save((e, editedDoc) => {
          if(e) return console.error(e);
          resolve();
        });
      } else {
        console.log("user already exists");
      }
    });
  });
}

function addEntry(textBody){
  return new Promise((resolve, reject) => {
    let Entry = schema.entries;
    Entry.count({}, (e, count) => {
      let entryItem = Entry({entryId: count, text: textBody, delay: 10 * SECOND});
      entryItem.save((e, editedDoc) => {
        if(e) return console.error(e);
        resolve();
      });
    });
  });
}