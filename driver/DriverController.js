// DriverController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Driver = require('./Driver');
var Rider = require('../rider/Rider');

// CREATES A NEW DRIVER
// POST /driver
// Creates a new driver object in the database using body of the request.
// The following code needs to be changed to fir the criteria for driver
router.post('/', function (req, res) {
    Driver.create({     // I believe all of this could be just req.body, this is just to test
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            location : req.body.location,
            available : req.body.available,
            occupancy : req.body.occupancy,
            assignedRider : req.body.assignedRider,
            
        }, 
        function (err, user) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
});


// RETURNS A SINGLE DRIVER BY THEIR ID
// GET /driver
// Returns the raw JSON of a driver given the id
// or returns an error if no driver is found with that ID
router.get('/:id', function (req, res) {
    Driver.findById(req.params.id, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200).send(user);
    });
});


// DRIVERS UPDATE THEIR AVAILABLITY STATUS
// PUT /driver/:id/availability should change
// the availability of a driver based on the request body
// Driver's availability should be updated in the database
router.put('/:id/availability', function (req, res) {
    Driver.findByIdAndUpdate(
        req.params.id,
        req.body,
        function (err, driver) {
            if (err) return res.status(500).send("There was a problem finding the driver.");
            res.status(200).send({
                sucess: true
            });
        }
    );
});

// DRIVERS UPDATE THEIR LOCATION STATUS
// PUT /driver/:id/location should change
// the location of a driver based on the request body
// Driver's location should be updated in the database
router.put('/:id/location', function (req, res) {
    Driver.findByIdAndUpdate(
        req.params.id,
        { "location" : req.body },
        function (err, driver) {
            if (err) return res.status(500).send("There was a problem finding the driver.");
            res.status(200).send({
                sucess: true
            });
        }
    );
});

// DRIVERS ACCESS CUSTOMER DESTINATION
// GET /driver/:id/assignedRider/destination should get
// the destination feild of the Rider object attatched to
// the driver given the ID
router.get('/:id/assignedRider/destination', async (req, res) => {

    // Grab the driver object with the assinged Driver
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
        return res.sendStatus(404).send("Error: Could not find Driver");
    }

    // Grab the Rider object from the assignedRider property
    const rider = await Rider.findById(driver.assignedRider);
    if (!rider) {
        return res.sendStatus(404).send("Error: No rider for this driver");
    }
   
    // send destination of rider
    res.send(await rider.destination);

});

// DRIVERS CAN ACCESS CUSTOMER LOCATION
// GET /driver/:id/assignedRider/location should get
// the location object from the Assigned Rider of the
// given Driver
router.get('/:id/assignedRider/location', async (req, res) => {

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
        return res.sendStatus(404).send("Error: could not find driver");
    }

    const rider = await Rider.findById(driver.assignedRider);
    if (!rider) {
        return res.sendStatus(404).send("Error: No rider for this Driver");
    }

    res.send( await rider.location);

});


//GETS DRIVER OCCUPANCY
// GET /driver/:id/occupancy
// returns json of a drivers occupancy given id
// error if no driver is found
// error if no driver occupancy is found
router.get('/:id/occupancy', async (req, res) => {
    const driver = await Driver.findById(req.params.id);
    if(!driver){
        return res.sendStatus(404).send("Error: Driver not found.");
    }
    //might want to change the status 404 here depending on what we want
    //to do if we encounter this error
    if(driver.occupancy == null){
        res.sendStatus(404).send("Error: No occupancy found.");
    }
    
    res.send({occupancy: driver.occupancy});

});

//UPDATES DRIVER OCCUPANCY
// PUT /driver/:id/occupancy
// returns json of a drivers occupancy given id
// error if no driver is found
router.put('/:id/occupancy', function (req, res) {
    Driver.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true},
        function (err, driver) {
            if (err) return res.status(500).send("There was a problem finding the driver.");
            res.status(200).send({
                driver
            });
        }
    );
});

module.exports = router;