//var express = require('express');
var betfair = require('betfair-sports-api');
//var http = require('http');

//var PORT = 4000;

//var app = express();
//var server = http.createServer(app);

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

//server.listen(PORT);

var username = myArgs[0];
var password = myArgs[1];
var session = '';

//app.get('/:username/:password', function(req, res) {
//	username = req.params.username;
//	password = req.params.password;
	
	session = betfair.newSession(username, password);

	session.open(
		
		function (err, res) {
    		console.log( !err ? "Login OK" : "Login error"); 
			process.exit(1);
		}
	);

	//res.sendfile(__dirname + '/index.html');
//});
