// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var request = require('request');
var CronJob = require('cron').CronJob;
var fs = require('fs');
var q = require('q');

//Schema
var ExchangeRate = require('./models/ExchangeRate');

// Express
var app = express();

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

// Endpoints
var file = './tmp/Bitcoin.json';
fs.readFile(file, 'utf8', function (err, data){
	console.log(data);
})


// var bitcoinJson = function(response){
// 	response.writeHead(200, {"Content-Type": "application/json"});
// 	var dfd = q.defer();
// 	fs.readFile(file, 'utf8', function (err,data) {
// 	  	if (err) {
// 	   		dfd.reject(err);
// 	  	} else{
// 	  		response.write(data);
// 	  		console.log(data);
// 	  		dfd.resolve();
// 		}
// 	});
// 	response.end();
// 	return dfd.promise;	
// };

// Gives current exchange rate data
var job = new CronJob ('00 */01 * * * *', function(){
	request('https://api.coindesk.com/v1/bpi/currentprice.json', function (error, response, body) {
  		if (!error && response.statusCode == 200) {
  			var exchangeParse = JSON.parse(body);
    		var newExchangeRate = new ExchangeRate({
    			exchangeRate: exchangeParse.bpi.USD.rate, 
    			date: exchangeParse.time.updated,
    			dateISO: exchangeParse.time.updatedISO
    		})
    		newExchangeRate.save(function(err, res){
    			if (err) return handleError(err);
    			console.log('rate', res);
    		})
  		}
	});
}, true);
job.start(); //sends data from the coindesk api every minute

// var blockjob = new CronJob ('00 00 09 * * *', function(){
// 	request ('', function(error, response, body){
// 		if(!error && response.statusCode == 200) {
// 			var blockParse = JSON.parse(body);
// 			var newBlockChain = new BlockChainData({
// 				Month: ,
// 				Day: ,
// 				Year: ,
// 				Price: ,
// 				totalCirculation: ,
// 				totalTransactionFees: ,
// 				numberOfUniqueBitcoinAddressesUsed: ,
// 				totalOutputVolumeValue: ,
// 				averageNumberOfTransactionsPerBlock: 
// 			})
// 			newBlockChain.push(file)
// 		}
// 	});
// }, true);
// blockjob.start(); //will add data to json file once a day

app.get ('/api/getData', function(req, res){
	ExchangeRate.find(req.query).exec(function(err, result){
		if(err) return res.status(500).send(err);
		res.send(result);
	});
});



// Connections
var port = 8081

var mongoUri = 'mongodb://localhost:27017/bitcurve';

mongoose.connect(mongoUri);
mongoose.connection.once('open', function(err, db) {
	if(!err) {
    	console.log('Connected to MongoDB at ', mongoUri);
  	}  
});

app.listen(port);
