var betfair = require('betfair-sports-api');
var async = require('async');
var request = require('request');

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

var username = myArgs[0];
var password = myArgs[1];
var events = myArgs[2];
var session = '';

request('http://odds.bestbetting.com/horse-racing/2012-07-12/newmarket/13-20/betting/', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body) // Print the google web page.
		}
	});

// Call functions syncrynously, passing results to next function.
async.waterfall(
	[	login, 
		getAllMarkets,
		filterMarkets,
		monitorMarketQueue, // Long running function. 
		logout ], 
		
	function(err, res) {
		console.log(res);
		process.exit(0);
	}
);

function AddThrottlingToSession() {

    var session = function(){
		this.getAllMarkets = function(hello) {
			return value;
		}
	}
	
	function Throttle (delay) {
		this.delay = delay; // in milliseconds.
		this.lastAccess = null; // datatime of last access.
	}
	
	Throttle.prototype.IsAccessable = function(now) {
		var elapsedT = new Date(now - this.lastAccess);
		return (elapsedT < this.delay) ? true : false;
	};
	
	session.prototype.callMethod = function(value, method) {
		console.log(t);
			if(this.t === null || this.t.IsAccessible === true)
			{
				console.log('IsAccessible');
				this[method](value);
			}
			this.t = new Throttle(10000);
		}
	}

	session.prototype.throttled = {
		getAllMarkets:this.callMethod(value, 'getAllMarkets')
	};
	
	var loop = setInterval(function () {
		session.throttled.getAllMarkets('hello');
		clearInterval(loop);    
    }, 100);   
}
AddThrottlingToSession();

function login(callback) {
    console.log('login to Betfair');
    session = betfair.newSession(username, password);
	
	
	console.log(session);
    session.open(function(err, res) {
        if (err)
            console.log('login failed, error is', err);
        else
            console.log('login OK');
        callback(err, res);
    });
}

function keepAlive(callback) {
    console.log('send keepAlive');cmd
    var invocation = session.keepAlive();
    invocation.execute(function(err, res) {
	
        if (err)
            console.log('keepAlive failed, error is', err);
        else
            console.log('keepAlive OK');
			
        callback(err,res);
    });
}

function getAllMarkets(res, callback) {

	console.log('Get available tennis matches');

    // eventTypeIds 1-soccer, 2-tennis, 7-todays card.
    var inv = session.getAllMarkets({
        eventTypeIds : [ events ]
    });

    inv.execute(function(err, res) {
		//console.log(res);
    	console.log(
			'action:', res.action, 
			', error:', err, 
			', duration:', res.duration() / 1000);
        
		if (err) {
			callback("Error in getAllMarkets", null);
    	}
		
		/*var selectedMarkets = [];
		
    	for ( var index in res.result.marketData) {
            
			if (!IsMatchingMarket(market))
                continue;		
			//var path = market.menuPath;//.replace(/\\Tennis\\Group A\\/g, '');

    	}*/
		//console.log(res.result.marketData);
		//console.log(callback);
        callback(null, res.result.marketData);
    });
}

function filterMarkets(markets, cb) {
	var filteredMarkets = [];
	
	for ( var index in markets) {
	
    	market = markets[index];
		
		if (market.marketName != 'To Be Placed' ||	// Don't get place races.
			market.countryCode == 'GBR' ||			// Only GBR.
			market.marketName != 'Reverse FC' ||	// Don't get reverse forcast.
			market.marketName != 'Forecast' ||		// Don't get forcast.
			market.numberOfRunners >= 4 ||			// 4 or more runners.
			market.numberOfRunners <= 20 ||			// but no more than 20.
			market.turningInPlay != 'Y') {			// Market isn't already in play.
			
			filteredMarkets.push(market);
		}
	}
	
	// Filter markets.
	cb(null, filteredMarkets);
}

function monitorMarketQueue(markets, cb) {
	// Loop through markets, spawning other processes.
	for(var index in markets) {
		//getMarket(markets[index].marketId);
	}
	
	cb(null, "All markets processed");
}

function getMarket(marketId) {

    //console.log('Call getMarket for marketId="%s"', events);
	
    var inv = session.getMarket(marketId);
	
    inv.execute(function(err, res) {
        console.log('action:', res.action, 'error:', err, 'duration:',
                res.duration() / 1000);
        if (err) {
            console.log("Error in getMarket", err);
        }
        
        console.log("marketId:", res.result.market.marketId);
        console.log("market name:", res.result.market.name);
        console.log("market time:", res.result.market.marketTime);

		for(var index in res.result.market.runners) {
        	//console.log("\tplayerOneId:", res.result.market.runners[index].selectionId);
        	console.log("\tHorse Name:", res.result.market.runners[index].name);
			console.log("\tHorse Object:", res.result.market.runners[index]);
		}

        //cb(null, "OK");
    });
}

var marketId = '105268904';
function getMarketPrices(cb) {
    console.log('Call getMarketPricesCompressed for marketId="%s"', marketId);
    var inv = session.getMarketPricesCompressed(marketId);
    inv.execute(function(err, res) {
        console.log('action:', res.action, 'error:', err, 'duration:',
                res.duration() / 1000);
        if (err) {
            cb("Error in getMarketPricesCompressed", null);
        }
        //console.log(util.inspect(res.result, false, 10));

        var market = res.result.marketPrices;
        console.log("marketId:", market.marketId);
        console.log("currency:", market.currency);
        console.log("marketStatus:", market.marketStatus);
        console.log("inPlayDelay:", market.inPlayDelay);
        // print players info
        for ( var playerIndex = 0; playerIndex < market.runners.length; ++playerIndex) {
            console.log("Horse %s", playerIndex);
            var runner = market.runners[playerIndex];
			console.log("\trunnerObject:", runner);
            console.log("\tselectionId:", runner.selectionId);
            console.log("\tlastPriceMatched:", runner.lastPriceMatched);
            console.log("\ttotalMatched:", runner.totalMatched);
            
			/*for ( var cnt = 0; cnt < runner.backPrices.length; ++cnt) {
                var item = runner.backPrices[cnt];
                console.log("\t back price:%s amount:%s", item.price, item.amount);
            }
            for ( var cnt = 0; cnt < runner.layPrices.length; ++cnt) {
                var item = runner.layPrices[cnt];
                console.log("\t lay price:%s amount:%s", item.price, item.amount);
            }*/
        }
        cb(null, 'OK');
    });
}

function logout(ok, callback) {
    console.log('logout');
    session.close(function(err, res) {
        if (err)
            console.log('logout failed, error is', err);
        else
            console.log('logout OK');
			
        callback(null,'Finished');
    });
}