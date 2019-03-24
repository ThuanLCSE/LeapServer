var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var Leap=require('leapjs');
var log = require('log-to-file');
var util = require('util');
var fs = require('fs');
var redis = require('redis');

const CHANNEL_REDIS = '123123';

var app = express();
//route url
var indexRouter = require('./routes/index');
var redisRouter = require('./routes/redis');
app.use('/', indexRouter);
app.use('/redis', redisRouter);
  // Set the application view engine and 'views' folder


app.use(morgan('combined'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', './public');
// Set view engine as EJS
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});
//Leap 192.168.99.103
console.log(Leap.version);
var controller = new Leap.Controller({
        host: '127.0.0.1',
        port: 6437});
// controller.on("frame", function(frame) {
//   console.log("Frame: " + frame.id + " @ " + frame.timestamp);
// });

var frameCount = 0;
var leapData1 = {};
controller.on("frame", function(frame) {
	leapData1 = frame
  // console.log(leapData1)
  	frameCount++;
});

setInterval(function() {
  var time = frameCount/2;
  // console.log("received " + frameCount + " frames @ " + time + "fps");
  //console.log(leapData1)
  
  if(leapData1.hands && leapData1.hands.length > 0)
    {
        var data = leapData1;
        data = {};
        data.hands = [];
        for(var i=0; i<leapData1.hands.length ; i++){
          nHand = {}
          nHand.arm = {}
          nHand.arm.palmNormal = leapData1.hands[i].palmNormal;
          nHand.arm.basis = leapData1.hands[i].arm.basis;
          nHand.arm.width = leapData1.hands[i].arm.width;
          nHand.arm.center = Array.prototype.slice.call(leapData1.hands[i].arm.center());

          nHand.confidence = leapData1.hands[i].confidence;
          nHand.fingers= []
          for(var j=0; j<leapData1.hands[i].fingers.length ; j++){
            var finger = {}
            finger.bones = []
            for (var k=0; k<leapData1.hands[i].fingers[j].bones.length; k++){
              var bone = {}
              bone.basis = leapData1.hands[i].fingers[j].bones[k].basis;
              bone.center = Array.prototype.slice.call(leapData1.hands[i].fingers[j].bones[k].center());
              bone.matrix = Array.prototype.slice.call(leapData1.hands[i].fingers[j].bones[k].matrix());
              bone.nextJoint = leapData1.hands[i].fingers[j].bones[k].nextJoint;
              bone.prevJoint = leapData1.hands[i].fingers[j].bones[k].prevJoint;
              finger.bones.push(bone)
            } 
            console.log(finger.bones[0].matrix)

            nHand.fingers.push(finger)
          } 
          data.hands.push(nHand);  
        } 
        data.id = leapData1.id; 
        var cache = [];
        var jsonToString = JSON.stringify(data, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Duplicate reference found
                    try {
                        // If this value does not reference a parent it can be deduped
                        return JSON.parse(JSON.stringify(value));
                    } catch (error) {
                        // discard key if value cannot be deduped
                        return;
                    }
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        })
        publisher.publish(CHANNEL_REDIS, jsonToString );
        fs.writeFileSync('./data.json', jsonToString , 'utf-8'); 
        // client.set('leap1data', util.inspect(data.pointables), redis.print);
        // client.set('leap1fram', leapData1.id, redis.print); 
    }
}, 100);

controller.on('ready', function() {
    console.log("ready");
});
controller.on('connect', function() {
    // console.log("connect");
});
controller.on('disconnect', function() {
    console.log("disconnect");
});
controller.on('focus', function() {
    console.log("focus");
});
controller.on('blur', function() {
    console.log("blur");
});
controller.on('deviceConnected', function() {
    console.log("deviceConnected");
});
controller.on('deviceDisconnected', function() {
    console.log("deviceDisconnected");
});

controller.connect();
console.log("\nWaiting for device to connect...");
module.exports = app;

//redis By default redis.createClient() will use 127.0.0.1 and port 6379
var publisher = redis.createClient('6379', '127.0.0.1'); 
publisher.publish(CHANNEL_REDIS, "Server LAUNCH");


publisher.on('error', function (err) {
  console.log('Error ' + err);
});

// client.hset('hash key', 'hashtest 1', 'some value', redis.print);
// client.hset(['hash key', 'hashtest 2', 'some other value'], redis.print);

// client.hkeys('hash key', function (err, replies) {

//   console.log(replies.length + ' replies:');
//   replies.forEach(function (reply, i) {
//     console.log('    ' + i + ': ' + reply);
//   });

//   client.quit();

// });
