'use strict'

const mongoose = require('mongoose');

module.exports = {
  users: require('./users')(mongoose),
  entries: require('./entries')(mongoose)
};