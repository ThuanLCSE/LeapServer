var express = require('express');
var router = express.Router();
var redis = require('redis'); 
var util = require('util');
var client = redis.createClient('6379', '127.0.0.1');

/* GET users listing. */
router.get('/', function(req, res, next) {
	client.get('leap1data', function (err, replies) {

	  // console.log(replies.length + ' replies:');
	  // replies.forEach(function (reply, i) {
	  //   console.log('    ' + i + ': ' + reply);
	  // });

	  // client.quit();
	  res.json({ data: JSON.parse(replies) ,
	  			error: err})
	});

 //  	client.get('leap1data', function (error, result) {
	//     if (error) {
	//         console.log("error occures hehe ");
	//         console.log(error); 
	//         res.json({ err: error })
	//     }
	//     console.log(result)
	//     res.json({ data: util.inspect(result) })
	// });

});
router.get('/1', function(req, res, next) {
  	client.get('leap1data', function (err, replies) {

	  // console.log(replies.length + ' replies:');
	  // replies.forEach(function (reply, i) {
	  //   console.log('    ' + i + ': ' + reply);
	  // });

	  // client.quit();
	  res.json({ data: err })
	});

});



module.exports = router;