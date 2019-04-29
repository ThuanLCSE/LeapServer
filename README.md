# Welcome to the Multi-Leap Motion Server!

The Multi-Leap Motion Server is a project academic of  **THALES** for **IMT Atlantique students** as part of the fourth semester.  
This server provide a technical way to consumpt **more than one** Leap Motion sensor on one computer. The system is made up of:  
-  Leap Motion sensor : hand detecting sensor, description can be found [here](https://www.leapmotion.com/)
-   Virtual machine : Running LeapMotionService in order to connect Leap Motion sensor and publish the data on a WebSocket server 
-   NodeJS server (the source code is provided in this github): middle ware web application, subscribing all the WebSocket from Virtual Machine then re-processing the data and and publishing them on Redis PUB/SUB channel
- Redis : running the [Publish/Subscribe messaging paradigm](http://en.wikipedia.org/wiki/Publish/subscribe). Published messages are characterized into channels. 
-   Client API : Subcribing Redis PUB/SUB channel and parse the data into native object. 

## Pre-requisites

- git - [Installation guide](https://www.linode.com/docs/development/version-control/how-to-install-git-on-linux-mac-and-windows/). 
- node.js - [Download page](https://nodejs.org/en/download/) .
- npm - comes with node .
- virtual machine with Leap Motion sensor - [Installation guide](https://docs.google.com/document/d/13ZYnwkZl0PUamOVASPAy-35uhGZ-YO__m0NwUs_eQ9k/edit?usp=sharing).
- Redis - [Installation file pour Windows](https://github.com/ServiceStack/redis-windows)


## Installation 
```
git clone https://github.com/ThuanLCSE/LeapServer.git
cd LeapServer
npm install
npm server.js
```
## Configuration
In **server.js**, these code below are used to set up REDIS host, port and the name of publish/subscribe channel 
> **Note:** By default, the channel's name is 'leapthuan'. If it is changed, the client must to be noticed the new name in order to subscribe.
```
const CHANNEL_REDIS = 'leapthuan'; 
var portRD = '6379'
var hostRD = '127.0.0.1'	
``` 
In **config.js** file, the information of Virtual Machine in order to listen the Leap Motion sensors is defined in JSON format:

```
[{
	"ip" : "127.0.0.1",
	"port" : 6437,
	"positionX" : 1.0,
	"positionY" : 2.0
},...
]
```
>The position X and Y are related to the position of the Leap Motion sensor on the table  
