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

const CHANNEL_REDIS = 'leapthuan';

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
var controller = new Leap.Controller({
        host: '192.168.56.101',
        port: 6437});
var controller2 = new Leap.Controller({
        host: '192.168.56.102',
        port: 6437}); 

var frameCount = 0;
var leapData1 = {};
var leapData2 = {};
controller.on("frame", function(frame) {
  leapData1 = frame 
});
controller2.on("frame", function(frame) {
  leapData2 = frame 
});


setInterval(function() {
  var time = frameCount/2;
  // console.log("received " + frameCount + " frames @ " + time + "fps");
  //console.log(leapData1)
  var multiHandData = {"sensors" : []}
  if(leapData1.hands && leapData1.hands.length > 0)
    {
        var sensorLeap = leapData1;
        sensorLeap = {};
        sensorLeap.hands = [];
        for(var i=0; i<leapData1.hands.length ; i++){
          nHand = {}
          nHand.palmPosition = leapData1.hands[i].palmPosition;
          nHand.id = leapData1.hands[i].id;
          nHand.arm = {} 
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
           // console.log(nHand.arm.center)

            nHand.fingers.push(finger)
          } 
          sensorLeap.hands.push(nHand);  
        } 
        sensorLeap.id = leapData1.id; 
        multiHandData.sensors.push(sensorLeap)
    }
    if(leapData2.hands && leapData2.hands.length > 0)
    {
        var sensorLeap = leapData2;
        sensorLeap = {};
        sensorLeap.hands = [];
        for(var i=0; i<leapData2.hands.length ; i++){
          nHand = {}
          nHand.palmPosition = leapData2.hands[i].palmPosition;
          nHand.id = leapData2.hands[i].id;
          nHand.arm = {} 
          nHand.arm.basis = leapData2.hands[i].arm.basis;
          nHand.arm.width = leapData2.hands[i].arm.width;
          nHand.arm.center = Array.prototype.slice.call(leapData2.hands[i].arm.center());

          nHand.confidence = leapData2.hands[i].confidence;
          nHand.fingers= []
          for(var j=0; j<leapData2.hands[i].fingers.length ; j++){
            var finger = {}
            finger.bones = []
            for (var k=0; k<leapData2.hands[i].fingers[j].bones.length; k++){
              var bone = {}
              bone.basis = leapData2.hands[i].fingers[j].bones[k].basis;
              bone.center = Array.prototype.slice.call(leapData2.hands[i].fingers[j].bones[k].center());
              bone.matrix = Array.prototype.slice.call(leapData2.hands[i].fingers[j].bones[k].matrix());
              bone.nextJoint = leapData2.hands[i].fingers[j].bones[k].nextJoint;
              bone.prevJoint = leapData2.hands[i].fingers[j].bones[k].prevJoint;
              finger.bones.push(bone)
            } 
           // console.log(nHand.arm.center)

            nHand.fingers.push(finger)
          } 
          sensorLeap.hands.push(nHand);  
        } 
        sensorLeap.id = leapData2.id; 
        multiHandData.sensors.push(sensorLeap) 
        // client.set('leap1data', util.inspect(data.pointables), redis.print);
        // client.set('leap1fram', leapData2.id, redis.print); 
    }
    var cache = [];
    var jsonToString = JSON.stringify(multiHandData, function(key, value) {
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
    if ((leapData2.hands && leapData2.hands.length > 0) && (leapData1.hands && leapData1.hands.length > 0)){
      console.log("leap 1 " + (leapData1.hands!=null?leapData1.hands.length:0) + "   leap 2 " + (leapData2.hands!=null?leapData2.hands.length:0));
    }
    
    publisher.publish(CHANNEL_REDIS, jsonToString );
    fs.writeFileSync('./data.json', jsonToString , 'utf-8'); 
}, 20);

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
controller2.connect();
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