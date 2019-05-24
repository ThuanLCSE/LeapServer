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
//Redis Pub Sub channel's name
const CHANNEL_REDIS = 'leapthuan';
//The host's IP and port connecting to Redis server. By default redis.createClient() will use 127.0.0.1 and port 6379
var portRD = '6379'
var hostRD = '127.0.0.1'
//initiate the publisher
var publisher = redis.createClient(portRD, hostRD);  
//The error and connect event listener of Redis
publisher.on('error', function (err) {
  console.log('Error ' + err);
}); 
publisher.on('connect', function() {
    console.log('connected to REDIS ' + portRD + " " + hostRD);
});

var app = express();
//routing url to server's file
var indexRouter = require('./routes/index'); 
app.use('/', indexRouter); 
//connect NodeJS's modules to express Server
app.use(morgan('combined'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', './public');
// Set view engine as EJS
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
 
var leapConfig = {}
var leapControllers = []
var leapData =[] ;
var fs = require('fs');
//read the connection parameter in config.json file into leapConfig object
fs.readFile('config.json', 'utf8', function(err, contents) {
  leapConfig =  JSON.parse(contents)
  for (var i = 0; i< leapConfig.length ; i++){
    var controller = new Leap.Controller({
      host: leapConfig[i].ip,
      port: leapConfig[i].port});
    //add the new Leap Controller . The detail of Leap Controller can be found here: https://developer-archive.leapmotion.com/documentation/javascript/api/Leap.Controller.html#Controller.frame
    leapControllers.push(controller);
    leapData[leapConfig[i].ip] = {}
    //Callbacks for the frame events 
    leapControllers[i].on('frame', (frame) => { leapData[frame.controller.connection.host] = frame});
    leapControllers[i].connect()
  }
});
//Process and publish the new received data on Redis PubSub channel
setInterval(function() {
  var multiHandData = {"sensors" : []} 
  var status = ""  
  for (var i = 0; i< leapConfig.length ; i++){
    //deep clone the whole frame object
    leap = leapData[leapConfig[i].ip]
    //convert origin Frame object into Sensor object that contains the configuration parameters in addition
    var sensor = new SensorFrame(leapConfig[i]); 
    sensor.status = leap.status
    if(leap.hands && leap.hands.length > 0){ 
      sensor.setFrame(leap);  
      for(var j=0; j<leap.hands.length ; j++){
        nHand = new Hand(leap.hands[j])  
        sensor.hands.push(nHand);   
      } 
      sensor.id = leap.id; 
    }
    multiHandData.sensors.push(sensor) 
    status = status  +leapConfig[i].ip+" hands: " + (leap.hands!=null?leap.hands.length:0)+ " "
  } 
  console.log(status); 
  //parse JSON to string
  var jsonToString = utilLeap.jsonToText(multiHandData) ;
  //publish the array of sensors on Redis channel
  publisher.publish(CHANNEL_REDIS, jsonToString); 
  //log data into data.json file
  fs.writeFileSync('./data.json', jsonToString, 'utf-8'); 
}, 20); //The interval delay (20ms)
module.exports = app;
