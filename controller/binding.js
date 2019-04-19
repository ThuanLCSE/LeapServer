class SensorFrame {
  constructor(config) {    
  	this.ip = config.ip 
	this.positionX = config.positionX
	this.positionY = config.positionY 
  }
  setFrame(data){
  	this.dump = data.dump();
    this.toString = data.toString();
    this.hands = [];
  }
};
class Hand {
  constructor(data) {   
    this.palmPosition = data.palmPosition;
	this.grabStrength = data.grabStrength;
	this.confidence = data.confidence;
	this.direction = data.direction;
	this.palmNormal = data.palmNormal;
	this.palmVelocity = data.palmVelocity;
	this.palmWidth = data.palmWidth;
	this.pinchStrength = data.pinchStrength;
	this.sphereCenter = data.sphereCenter;
	this.sphereRadius = data.sphereRadius;
	this.stabilizedPalmPosition = data.stabilizedPalmPosition;
	this.type = data.type; 
	this.toString = data.toString();
	this.roll = data.roll();
	this.pitch = data.pitch();
	this.yaw = data.yaw();  
	this.arm = {}
  	this.arm = new Arm(data.arm)    
  	this.setFingers(data.fingers)
  }
  setFingers(fingerData){
	this.fingers= []
  	for(var j=0; j<fingerData.length ; j++){
	    var finger = new Finger(fingerData[j])   
	    this.fingers.push(finger)
  	} 
  }

};

class Arm {
  constructor(data) {   
    this.basis = data.basis;
	this.width = data.width;
	this.center = Array.prototype.slice.call(data.center());
	this.matrix = Array.prototype.slice.call(data.matrix());
	this.nextJoint = data.nextJoint;
	this.prevJoint = data.prevJoint;
	this.direction = data.direction;
	this.type = data.type;
  }

};
class Finger {
  constructor(data) {   
    this.bones = []
    this.type = data.type
    this.extended = data.extended
    this.toString = data.toString() 
    this.carpPosition = Array.prototype.slice.call(data.carpPosition);
    this.dipPosition = Array.prototype.slice.call(data.dipPosition);
    this.mcpPosition = Array.prototype.slice.call(data.mcpPosition);
    this.pipPosition = Array.prototype.slice.call(data.pipPosition);
    this.tipPosition = Array.prototype.slice.call(data.tipPosition);
    this.length = data.length
    this.timeVisible = data.timeVisible
    this.type = data.type 
    this.width = data.width 
    this.setBones(data.bones)
  } 
  setBones(bonesData){
  	for (var k=0; k<bonesData.length; k++){
		var bone = new Bone(bonesData[k]) 
		this.bones.push(bone)
	} 
  }
};
class Bone {
  constructor(data) {   
    this.basis = data.basis;
	this.center = Array.prototype.slice.call(data.center());
	this.matrix = Array.prototype.slice.call(data.matrix());
	this.nextJoint = data.nextJoint;
	this.prevJoint = data.prevJoint;
	this.width = data.width;
	this.type = data.type;
  } 
};
module.exports = {
	SensorFrame,
	Hand,
	Arm,
	Finger,
	Bone
}
 