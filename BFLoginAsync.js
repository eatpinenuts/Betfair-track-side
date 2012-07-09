var betfair = require('betfair-sports-api');
var async = require('async');

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

var username = myArgs[0];
var password = myArgs[1];
var events = myArgs[2];
var session = '';

async.series([ login, getAllMarkets, logout ], function(err, res) {
    process.exit(0);
});

function login(callback) {
    console.log('login to Betfair');
    session = betfair.newSession(username, password);
	console.log(session);
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

function getAllMarkets(cb) {
    console.log('Get available tennis matches');

    // eventTypeIds 1-soccer, 2-tennis, 7-todays card.
    var inv = session.getAllMarkets({
        eventTypeIds : [ events ]
    });
    inv.execute(function(err, res) {
        console.log('action:', res.action, 'error:', err, 'duration:', res
                .duration() / 1000);
        if (err) {
			cb("Error in getAllMarkets", null);
        }
        for ( var index in res.result.marketData) {
            market = res.result.marketData[index];
            if (market.marketName != 'Match Odds')
                continue;
            var path = market.menuPath;//.replace(/\\Tennis\\Group A\\/g, '');
            console.log(market);
        }
        cb(null, "OK");
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