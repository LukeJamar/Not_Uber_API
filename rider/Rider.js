// Rider.js
var mongoose = require('mongoose');  
var RiderSchema = new mongoose.Schema({  
  firstName: String,
  lastName: String,
  location: {
    lat: Number,
    lon: Number
  },
  destination: String,
  occupancy: Number,
  assignedDriver: {type: mongoose.Schema.Types.ObjectId, ref: 'Driver'}   // Refferences Drver object
});
mongoose.model('Rider', RiderSchema);
module.exports = mongoose.model('Rider');