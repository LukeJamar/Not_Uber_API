// server.js
var app = require('./app');
var port = process.env.PORT || 30000;	// Port should be edited
var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});