'use strict'
let port = process.env.PORT || 3000;
const dbConn = process.env.DBCONN || "mongodb://localhost/cellphone-novel";
const express = require('express');
const cons = require('consolidate');
const swig = require('swig');
const phone = require('phone');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const dbUtils = require('./db_utils');
const app = express();

mongoose.connect(dbConn);

app.engine('html', cons.swig);
app.set('view engine', 'html');

// Routes
app.get('/', userUtilities);
app.get('/admin', adminUtilities);
app.get('/sms/user', userSignUp);

function adminUtilities(req, res){
  dbUtils.readEntries().then((entries) => {
    res.render('admin', {entries: entries});
  })

  let entry = req.query.entry;
  let delayTime = {
    days: req.query.days,
    hour: req.query.hour,
    minute: req.query.minute
  };
  if(entry){
    dbUtils.addEntry(entry, delayTime);
  }
}

function userUtilities(req, res){
  res.render('index', {});
  let phoneNumber = phone(req.query.phone)[0];
  if(phoneNumber){
    dbUtils.addUser(phoneNumber);
  }
}

function userSignUp(req, res){
  console.log('received message');
}

app.listen(port, function(){
  console.log('server running on port: ' + port);
});

schedule.scheduleJob('*/1 * * * *', function(){
  dbUtils.userLoop();
});