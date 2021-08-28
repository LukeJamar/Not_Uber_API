// app.js
var express = require('express');
var app = express();
var db = require('./db');
var DriverController = require('./driver/DriverController');  // To be edited for drivers :edited
var RiderController = require('./rider/RiderController');
app.use('/driver', DriverController);                      // To be edited for drivers  :edited
app.use('/rider', RiderController);
module.exports = app;