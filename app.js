'use strict'
let port = process.env.PORT || 3000;
const dbConn = process.env.DBCONN || "mongodb://localhost/cellphone-novel";
const express = require('express');
const cons = require('consolidate');
const swig = require('swig');
const phone = require('phone');
const moment = require('moment');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const schema = require('./db/databaseSchema');
const TWILIO_ACCOUNT_SID = require('./config.js').TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = require('./config.js').TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = require('./config.js').TWILIO_PHONE_NUMBER;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const app = express();

moment().format();

mongoose.connect(dbConn);
const db = mongoose.connection;

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.get('/', function(req, res){
  res.render('index', {});

  let entry = req.query.entry;
  let delayTime = {
    days: req.query.days,
    hour: req.query.hour,
    minute: req.query.minute
  };
  let phoneNumber = phone(req.query.phone)[0];
  if(phoneNumber){
    addUser(phoneNumber);
  }
  if(entry){
    addEntry(entry, delayTime);
  }
});

app.listen(port, function(){
  console.log('server running on port: ' + port);
});

schedule.scheduleJob('*/1 * * * *', function(){
  userLoop();
});

function addUser(usr){
  return new Promise((resolve, reject) => {
    let User = schema.users;
    User.findOne({userId: usr}, (e, user) => {
      if(e) reject(e);
      if(!user){
        let userItem = User({userId: usr, currentEntry: 0, active: true});
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

function userLoop(){
  let now = moment();
  console.log('now', now._d);
  let User = schema.users;
  User.find({}, (e, users) => {
    users.forEach((u) => {
      if(u.active){
        readEntry(u.currentEntry).then((entryObj) => {
          let delay = entryObj.delay;
          let date = moment().hour(delay.hour).minute(delay.minute);
          date.add(delay.days, 'd');
          console.log('date:', date._d);
          if(date.isSameOrBefore(now)){
            smsEntry(u.userId, entryObj);
          }
        });
      }
    });
  });
}

function addEntry(textBody, delayTime){
  return new Promise((resolve, reject) => {
    let Entry = schema.entries;
    Entry.count({}, (e, count) => {
      let entryItem = Entry({
        entryId: count,
        text: textBody,
        delay: {
          days: delayTime.days,
          hour: delayTime.hour,
          minute: delayTime.minute
        }
      });
      entryItem.save((e, editedDoc) => {
        if(e) return console.error(e);
        console.log('new entry added:', textBody);
        resolve();
      });
    });
  });
}

function readEntry(id){
  return new Promise((resolve, reject) => {
    let Entry = schema.entries;
    Entry.findOne({entryId: id}, (e, entry) => {
      if(e) return console.error(e);
      resolve(entry);
    });
  });
}

function incCurrent(id, nextEntry){
  return new Promise((resolve, reject) => {
    let User = schema.users;
    User.update({userId: id}, {currentEntry: nextEntry}, (e, editedDoc) => {
      if(e) return console.error(e);
      resolve();
    });
  });
}

function smsEntry(userId, entry){
  client.messages.create({
    to: userId,
    from: TWILIO_PHONE_NUMBER,
    body: entry.text,
  }, function(e, message) {
    console.log('message to ', message.to, ' successful');
    let nextEntry = entry.entryId + 1;
    incCurrent(userId, nextEntry);
  });
}