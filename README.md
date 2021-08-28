# NUber (Not Uber)

## Running program
    program requires these installations in order to run
    node.js: https://nodejs.org/en/
    The Following commands must be run to start the program
        npm install express --save
        npm install mongodb --save
        npm install mongoose --save
        npm install body-parser --save
        npm install axios --save

Commands to Run Program:
    node server.js
    or run server.js without terminal

## Driver
### POST /driver - creates a new driver
    Adds a new driver to the database with a unset assigned rider

### GET /driver/:id - finds a driver by their id
    Returns a driver object if id param matches one in Database

### PUT /driver/:id/availability - updates driver availability
    Returns success if the availability was sucessfully updated

### PUT /driver/:id/location - updates driver location
    Returns success if the location object was sucessfully updated

### GET /driver/:id/assignedRider/destination - accesses customer destination
    Returns the destination property of the Rider attatched to the
    current driver

### GET /driver/:id/assignedRider/location - access customer location
    Returns the location object of the Rider attatched to the current Driver

### GET /driver/:id/occupancy - access driver occupancy
    Returns the occupancy field of the Driver given their ID

### PUT /driver/:id/occupancy - updates driver occupancy
    Returns updated driver object with new occupancy


## Rider
### POST /rider - creates a new rider
    Adds a new driver to the database with a unset assigned driver

### GET /rider/:id - finds a rider by their id
    Returns a driver object if id param matches one in Database

### PUT /rider/:id/destination - updates rider destination
    Returns success if the the rider's destination was properly updated

### PUT /rider/:id/location - updates rider location
    Returns object of the updated rider with new location

### PUT rider/:id/selectDriver - assigns Driver to current Rider
    Returns success if the driver in body was assigned to Rider

### GET /rider/:id/assignedDriver/location - get location of attached Driver
    Returns the location object of the Riders assigned Driver

### PUT /rider/:id/endRide - cancels the ride with current driver
    Returns success if the rider is sucessfully disconnected from the Driver

### GET /rider/:id/nearbyDrivers - finds available drivers in a 10 mile radius
    Returns a list of drivers who are available in a 10 mile Radius of the Rider

### GET /rider/:id/nearestDriver - finds driver closest to the rider
    Returns the driver with the smallest distance from the Rider