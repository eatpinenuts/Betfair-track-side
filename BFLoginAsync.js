var betfair = require('betfair-sports-api');
var async = require('async');
var http = require('http'), url = require('url');


var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

var username = myArgs[0];
var password = myArgs[1];
var events = myArgs[2];
var session = '';

async.series([ login, getAllMarkets, getMarket, getMarketPrices, bookiesExtract, logout ], function(err, res) {
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
	
	function IsMatchingMarket(market) {
		if (market.marketName == 'To Be Placed' || 
			market.countryCode != 'GBR' ||
			market.marketName == 'Reverse FC' ||
			market.marketName == 'Forecast' ||
			market.numberOfRunners < 4 ||
			market.numberOfRunners > 20 ||
			market.turningInPlay == 'Y')
			return false;
		else
			return true;
	}

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
			cb("Error in getAllMarkets", null);
    	}

    	for ( var index in res.result.marketData) {
    		market = res.result.marketData[index];
            
			if (!IsMatchingMarket(market))
                continue;
				
			//console.log(market);
        	
			var path = market.menuPath;//.replace(/\\Tennis\\Group A\\/g, '');

			console.log(path);
    	}

        cb(null, "OK");

    });
}

function getMarket(cb) {
    console.log('Call getMarket for marketId="%s"', events);
    var inv = session.getMarket('105268904');
    inv.execute(function(err, res) {

        console.log('action:', res.action, 'error:', err, 'duration:',
                res.duration() / 1000);
        if (err) {
            cb("Error in getMarket", null);
        }
        
        console.log("marketId:", res.result.market.marketId);
        console.log("market name:", res.result.market.name);
        console.log("market time:", res.result.market.marketTime);

		for(var index in res.result.market.runners) {
        	//console.log("\tplayerOneId:", res.result.market.runners[index].selectionId);
        	console.log("\tHorse Name:", res.result.market.runners[index].name);
			//console.log("\tHorse Object:", res.result.market.runners[index]);
		}

        cb(null, "OK");
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
			//console.log("\trunnerObject:", runner);
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

function bookiesExtract(callback) {
	
	console.log('bookiesExtract');

	var options = {
  		host: 'odds.bestbetting.com',
  		port: 80,
  		path: '/horse-racing/2012-07-12/newmarket/13-20/betting/',
		'user-agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6'
	};

	function request() {
		http.get(options, function(response) {
			// The page has moved make new request
			if (response.statusCode === 302) {
				var newLocation = url.parse(response.headers.location).host;
				console.log('We have to make new request ' + newLocation);
				options.host = newLocation;
				options.path = '';
				request();
			} else {
				console.log("Response: %d", response.statusCode);
				response.on('data', function(chunk) {
					console.log('Body ' + chunk);
					callback(null, "OK");
				});
			}
		}).on('error', function(err) {
			console.log('Error %s', err.message);
			callback(err.message, "Fail");
		});
	}

	request();


	
	/*http.get(options, function(res) {
  		console.log("Got response: " + res.statusCode);

  		res.on("data", function(chunk) {
    		console.log("BODY: " + chunk);
			callback(null, "OK");
  		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
		callback(e.message, "Fail");
	});*/
}