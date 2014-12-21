'use strict';
 
var express = require('express'),
    http    = require('http'),
    path    = require('path');
 
var app = express();
 
app.set('port', process.env.PORT || 3000);
 
app.use(express.static(path.join(__dirname, 'www')));
 
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'www/views/index.html'));
});
 
var server = app.listen(app.get('port'), function() {
  console.log('Server listening on port ' + server.address().port);
});