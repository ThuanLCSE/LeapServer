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
var utilLeap = require('./controller/util');
var {SensorFrame,Hand,Arm,Finger,Bone} = require('./controller/binding');

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

app.listen(8000, () => {
  console.log('Server is listening on port 8000!')
});
//Leap 192.168.99.103 
var controller = new Leap.Controller({
        host: '192.168.56.106',
        port: 6437});
var controller2 = new Leap.Controller({
        host: '192.168.56.105',
        port: 6437}); 
var controller3 = new Leap.Controller({
        host: '192.168.56.104',
        port: 6437}); 


var frameCount = 0;
var leapData1 = {};
var leapData2 = {};
var leapData3 = {};
setInterval(function() {
  var time = frameCount/2;
  // console.log("received " + frameCount + " frames @ " + time + "fps");
  //console.log(leapData1)
  var multiHandData = {"sensors" : []}
  var sensorLeap = {}
  if(leapData1.hands && leapData1.hands.length > 0){ 
    sensorLeap = new SensorFrame(leapData1); 
    for(var i=0; i<leapData1.hands.length ; i++){
      nHand = new Hand(leapData1.hands[i])  
      sensorLeap.hands.push(nHand);  
      // console.log(nHand.arm.center) 
    } 
    sensorLeap.id = leapData1.id; 
  }
  sensorLeap.positionX = 0.0;
  sensorLeap.positionY = 0.0;
  multiHandData.sensors.push(sensorLeap)

  var sensorLeap = {}
  if(leapData2.hands && leapData2.hands.length > 0) {
    var sensorLeap = new SensorFrame(leapData2); 
    for(var i=0; i<leapData2.hands.length ; i++){
      nHand = new Hand(leapData2.hands[i])  
      sensorLeap.hands.push(nHand);    
    } 
    sensorLeap.id = leapData2.id; 
  } 
  sensorLeap.positionX = 0.0;
  sensorLeap.positionY = 0.0;
  multiHandData.sensors.push(sensorLeap)
  
  var sensorLeap = {}
  if(leapData3.hands && leapData3.hands.length > 0) {
    var sensorLeap = new SensorFrame(leapData3); 
    for(var i=0; i<leapData3.hands.length ; i++){
      nHand = new Hand(leapData3.hands[i])  
      sensorLeap.hands.push(nHand);    
    } 
    sensorLeap.id = leapData2.id; 
  } 
    sensorLeap.positionX = 0.0;
    sensorLeap.positionY = 0.0;
    multiHandData.sensors.push(sensorLeap)
  var jsonToString = utilLeap.jsonToText(multiHandData) 
  // if ((leapData2.hands && leapData2.hands.length > 0) && (leapData1.hands && leapData1.hands.length > 0)){
  console.log("leap 1 " + (leapData1.hands!=null?leapData1.hands.length:0) + "   leap 2 " + (leapData2.hands!=null?leapData2.hands.length:0) +"   leap 3 " + (leapData3.hands!=null?leapData3.hands.length:0));
  // } 
  publisher.publish(CHANNEL_REDIS, jsonToString ); 
  //fs.writeFileSync('./data.jso/**/n', jsonToString , 'utf-8'); 
}, 20);

controller.on('ready', function() {
    console.log("ready");
});
controller.on('connect', function() {
    console.log("connect Leap device");
});
controller.on('disconnect', function() {
    console.log("disconnect");
});
controller.on('focus', function() {
    console.log("focus Leap device");
});
controller.on('blur', function() {
    console.log("blur");
}); 
controller.on('frame',  (frame) => { leapData1 = frame });
controller.connect()
controller2.on("frame", function(frame) {
  leapData2 = frame 
}); 
controller2.connect();
controller3.on('frame',  (frame) => { leapData3 = frame });
controller3.connect()
console.log("\nWaiting for Leap device to connect...");
module.exports = app;

//redis By default redis.createClient() will use 127.0.0.1 and port 6379
var portRD = '6379'
var hostRD = '127.0.0.1'
var publisher = redis.createClient(portRD, hostRD); 
publisher.publish(CHANNEL_REDIS, "Server LAUNCH");
publisher.on('error', function (err) {
  console.log('Error ' + err);
}); 
publisher.on('connect', function() {
    console.log('connected to REDIS ' + portRD + " " + hostRD);
});
publisher.on('error', function (err) {
  console.log('Error ' + err);
}); 