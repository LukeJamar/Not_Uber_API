// RiderController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Rider = require('./Rider');
var Driver = require('../driver/Driver');
var axios = require('axios');


// CREATES A NEW RIDER
// POST /rider
// Creates a new rider object in the database using body of the request.
router.post('/', function (req, res) {
    Rider.create({     // I believe all of this could be just req.body, this is just to test
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            location : req.body.location,
            destination : req.body.destination,
            assignedDriver : req.body.assignedDriver
        }, 
        function (err, user) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
});

// RETURNS A SINGLE RIDER BY THEIR ID
// GET /rider
// Returns the raw JSON of a rider given the id
// or returns an error if no rider is found with that ID
router.get('/:id', function (req, res) {
    Rider.findById(req.params.id, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200).send(user);
    });
});

// UPDATES RIDER DESTINATION IN DATABASE
// PUT /rider/:id/destination
// Returns JSON sucess if the destination was updated
// or returns an error if no rider is found with that ID
router.put('/:id/destination', function (req, res) {
    Rider.findByIdAndUpdate(
        req.params.id,
        req.body,
        function (err, rider) {
            if (err) return res.status(500).send("There was a problem finding the rider.");
            res.status(200).send({
                sucess: true
            });
        }
    );
});

// UPDATES RIDER LOCATION IN DATABASE
	// PUT /rider/:id/location
	// Returns error if no rider is found with that ID
	router.put('/:id/location', function (req, res) {
	    Rider.findByIdAndUpdate( req.params.id, { "location" : req.body }, function (err, rider) {
	    	if (err) return res.status(500).send("There was a problem finding the rider.");
            res.status(200).send(rider);
	    });
	});


// REST call PUT rider/:id/selectDriver adds a selected driver to the rider
// :ID is the rider ID
// The assigned driver is updated from the body
// The availablity
router.put('/:id/selectDriver', async (req, res) => {

    //find the driver by id and get the availabity

    const driver = await Driver.findById(req.body.assignedDriver);

    //if the driver is available update the driver for the user
    if (driver.available){
        Rider.findByIdAndUpdate(
            req.params.id,
            req.body,
            function (err, rider){
                if (err) return res.status(500).send("Error /:id/selectDriver");
            }
        );
    }

    //Change driver's availility to false
    Driver.findByIdAndUpdate(
        req.body.assignedDriver,
        {"available" : false, "assignedRider" : req.params.id},
        function (err, driver){
            if (err) return res.status(500).send("Error /:id/selectDriver");
            res.status(200).send({
                success: true
            });
        }
    );


});

// REST call GET /rider/:id/assignedDriver/location gets
// a specific rider by id, gets the driver attatched to the rider,
// then return the location of the assigned driver
router.get('/:id/assignedDriver/location', async (req, res) => {

    // grab rider by ID
    const rider = await Rider.findById(req.params.id);
    if (!rider) {
        return res.sendStatus(404).send("Error: Rider could not be found");
    }

    // grab driver from assignedDriver object
    const driver = await Driver.findById(rider.assignedDriver);
    if (!driver) {
        return res.sendStatus(404).send("Error: No driver for this rider");
    }

    res.send( await driver.location);

});

//REST call REST call PUT /rider/:id/endRide
// that disconnects from the driver
// and visa versa
// The rider and driver are null
// Available will be true
router.put('/:id/endRide', async (req, res) => {

    //Get the rider by id
    const rider = await Rider.findById(req.params.id);
    const assignedDriver = await rider.assignedDriver;

    if (!rider) {
        return res.sendStatus(404).send("Error: Rider could not be found");
    }


    //Update the rider to being available and the
    //assignedDriver is null
    Rider.findByIdAndUpdate(
        req.params.id,
        req.body,
        function (err, rider){
            if (err) return res.status(500).send("Error");

        }
    );

    //Based on the assigned driver for rider,
    //update the
    //Change driver's availility to true
    Driver.findByIdAndUpdate(
        assignedDriver,
        {"available" : true, "assignedRider" : null},
        function (err, driver){
            if (err) return res.status(500).send("Error");
            res.status(200).send({
                success: true
            });
        }
    );

    });

// REST call  GET /rider/:id/nearbyDrivers gets all of the
// available drivers in a 10 mile radius of the designated Rider.
// Uses the Google-distance matrix API to obain distance
// Returns an array of all of the available drivers within that distance
router.get("/:id/nearbyDrivers", async (req, res) => {

    // Get rider object for coordinates
    const rider = await Rider.findById(req.params.id);
    if (!rider) {
        return res.sendStatus(404).send("failed at rider");
    }

     // obtain all available drivers
     const availableDrivers = await Driver.find(
         { available : true }
     );


    // Variables used to collect the available drivers in radius
    var distances;          // store distance for each driver 
    var driversInRad = [];  // Collect all drivers in radius
    var index;
    const metersPerMile = 1609; // Number of meters in a Mile

    // loop to obtain the distances of every available driver 
    for (index = 0; index < availableDrivers.length; index++) {

        // Axios call fitting the style of the google matrix API
        // Ex. 
        const googleMatrix = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?', {
            params: {
                origins: availableDrivers[index].location.lat.toString() + ','
                         + availableDrivers[index].location.lon.toString(),
                destinations: rider.location.lat.toString() + ',' + rider.location.lon.toString(),
                units: 'imperial',
                key: 'lmao no' // get your own API key
            }
        });

        // Verify the request suceeded given querey parameters
        if (!googleMatrix.data) {
            return res.sendStatus(404).send("The request failed");
        }
        // obtain distance value in miles
        distances = googleMatrix.data.rows[0].elements[0].distance.value / metersPerMile;

        // add driver to object array if within 10 miles
        if (distances <= 10) {
            var goodDriver = {
                "name" : availableDrivers[index].firstName,
                "id" : availableDrivers[index]._id,
                "location" : availableDrivers[index].location
            }

            driversInRad.push(goodDriver);
        }
    }

    if (!driversInRad) {
        return res.sendStatus(404).send("No nearby Drivers in your area");
    }
    res.status(200).send(driversInRad);

});


// REST call  GET /rider/:id/nearestDriver gets the closest
// availalble driver using the google distance API
// Returns an object of the driver with name, id, distance, and locaion
router.get('/:id/nearestDriver/', async (req, res) => {

    // Get rider object for coordinates
    const rider = await Rider.findById(req.params.id);
    if (!rider) {
        return res.sendStatus(404).send("failed at rider");
    }

    // obtain all available drivers
    const availableDrivers = await Driver.find(
        { available : true }
    );    

    var distances;          // store distance for each driver 
    var closestDriver;      // template for closest Driver
    var index;
    const metersPerMile = 1609; // Number of meters in a Mile

    // loop to obtain the distances of every available driver 
    for (index = 0; index < availableDrivers.length; index++) {

        // Axios call fitting the style of the google matrix API
        // Ex. 
        const googleMatrix = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?', {
            params: {
                origins: availableDrivers[index].location.lat.toString() + ','
                         + availableDrivers[index].location.lon.toString(),
                destinations: rider.location.lat.toString() + ',' + rider.location.lon.toString(),
                units: 'imperial',
                key: 'AIzaSyBK9h3HQR77CKSzWp73MePl3BmzcTEjQTU'
            }
        });

        // Verify the request suceeded given querey parameters
        if (!googleMatrix.data) {
            return res.sendStatus(404).send("The request failed");
        }
        // obtain distance value in miles
        distances = googleMatrix.data.rows[0].elements[0].distance.value / metersPerMile;

        // add Current driver is closer than last driver
        if( index == 0 || distances < closestDriver.distance) {
            closestDriver = {
                "name" : availableDrivers[index].firstName,
                "id" : availableDrivers[index]._id,
                "distance" : distances,
                "location" : availableDrivers[index].location
            }
        }
    }

    // Return the closest driver or error if no available drivers
    if (!closestDriver) {
        return res.sendStatus(404).send("No drivers are available right now");
    }
    res.status(200).send(closestDriver);
    
});

//GETS RIDER OCCUPANCY
// GET /rider/:id/occupancy
// returns json of a riders occupancy given id
// error if no rider is found
// error if no rider occupancy is found
router.get('/:id/occupancy', async (req, res) => {
    const rider = await Rider.findById(req.params.id);
    if(!rider){
        return res.sendStatus(404).send("Error: Driver not found.");
    }
    //might want to change the status 404 here depending on what we want
    //to do if we encounter this error
    if(rider.occupancy == null){
        res.sendStatus(404).send("Error: No occupancy found.");
    }
    
    res.send({occupancy: rider.occupancy});

});

//UPDATES RIDER OCCUPANCY
// PUT /rider/:id/occupancy
// returns json of a riders occupancy given id
// error if no riders is found
router.put('/:id/occupancy', function (req, res) {
    Rider.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true},
        function (err, rider) {
            if (err) return res.status(500).send("There was a problem finding the rider.");
            res.status(200).send({
                rider
            });
        }
    );
});




module.exports = router