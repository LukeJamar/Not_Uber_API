// Driver.js
var mongoose = require('mongoose');  
var DriverSchema = new mongoose.Schema({  
  firstName: String,
  lastName: String,
  location: {
    lat: Number,
    lon: Number
  },
  available: Boolean,
  occupancy: Number,
  assignedRider: {type: mongoose.Schema.Types.ObjectId, ref: 'Rider'}
  // Refferences the Rider object
  
});
mongoose.model('Driver', DriverSchema);
module.exports = mongoose.model('Driver');