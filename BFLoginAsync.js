var betfair = require('betfair-sports-api');
var async = require('async');

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

var username = myArgs[0];
var password = myArgs[1];
var session = '';

async.series([ login, keepAlive, logout ], function(err, res) {
    process.exit(0);
});

function login(callback) {
    console.log('login to Betfair');
    session = betfair.newSession(username, password);
    session.open(function(err, res) {
        if (err)
            console.log('login failed, error is', err);
        else
            console.log('login OK');
        callback(err,res);
    });
}

function keepAlive(callback) {
    console.log('send keepAlive');
    var invocation = session.keepAlive();
    invocation.execute(function(err, res) {
        if (err)
            console.log('keepAlive failed, error is', err);
        else
            console.log('keepAlive OK');
        callback(err,res);
    });
}

function logout(callback) {
    console.log('logout');
    session.close(function(err, res) {
        if (err)
            console.log('logout failed, error is', err);
        else
            console.log('logout OK');
        callback(err,res);
    });
}