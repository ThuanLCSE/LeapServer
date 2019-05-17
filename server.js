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

var app = express();
//route url
var indexRouter = require('./routes/index');
var redisRouter = require('./routes/redis');
app.use('/', indexRouter);
app.use('/redis', redisRouter);

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

var leapConfig = {}
var leapControllers = []
var leapData =[] ;
var fs = require('fs');
fs.readFile('config.json', 'utf8', function(err, contents) {
  leapConfig =  JSON.parse(contents)
  for (var i = 0; i< leapConfig.length ; i++){
    var controller = new Leap.Controller({
      host: leapConfig[i].ip,
      port: leapConfig[i].port});
    leapControllers.push(controller);
    leapData[leapConfig[i].ip] = {}
    leapControllers[i].on('frame', (frame) => { leapData[frame.controller.connection.host] = frame});
    leapControllers[i].connect()
  }
});
 
setInterval(function() {
  var multiHandData = {"sensors" : []} 
  var status = ""  
  for (var i = 0; i< leapConfig.length ; i++){
    //deep clone object
    leap = leapData[leapConfig[i].ip]
    var sensor = new SensorFrame(leapConfig[i]); 
    sensor.status = leap.status
    if(leap.hands && leap.hands.length > 0){ 
      sensor.setFrame(leap);  
      for(var j=0; j<leap.hands.length ; j++){
        nHand = new Hand(leap.hands[j])  
        sensor.hands.push(nHand);  
        // console.log(nHand.arm.center) 
      } 
      sensor.id = leap.id; 
    }
    multiHandData.sensors.push(sensor) 
    status = status  +leapConfig[i].ip+" hands: " + (leap.hands!=null?leap.hands.length:0)+ " "
  } 
  console.log(status); 
  var jsonToString = utilLeap.jsonToText(multiHandData) 
 
  publisher.publish(CHANNEL_REDIS, jsonToString ); 
  fs.writeFileSync('./data.json', jsonToString , 'utf-8'); 
}, 100);
module.exports = app;
