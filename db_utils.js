'use strict'
const mongoose = require('mongoose');
const schema = require('./db/databaseSchema');
const moment = require('moment');
const sms = require('./send_message');

moment().format();
console.log('utils');

module.exports = {
  addUser: addUser,
  addEntry: addEntry,
  userLoop: loop,
  readEntry: readEntry
};

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

function loop(){
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
            sms(u.userId, entryObj, incCurrent);
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