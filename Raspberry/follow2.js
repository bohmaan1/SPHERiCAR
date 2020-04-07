const { Scanner, Utils, SpheroBolt } = require("spherov2.js");
const Gpio = require('pigpio').Gpio;
const gamepad = require("gamepad");

gamepad.init(); 							// Initialize the library
setInterval(gamepad.processEvents, 16); 	// Create a game loop and poll for events
setInterval(gamepad.detectDevices, 5000);	// Scan for new gamepads as a slower rate

const BUTTONS = {
	A: 0,
	B: 1,
	X: 2,
	Y: 3,
	CHANGE_VIEW: 6,
	MENU: 7
};

// Initiera bollarna
const boltNames = ["SB-5AEB"];
const numOfBolts = boltNames.length;
var bolts = Array(numOfBolts);

/*
 * Max speed can be set to anything between 0 - 255.
 * Max speed of the Bolt is 2 m/s which should respond to value 255.
 */
//const maxSpeed = 120;

gamepad.on("down", async function(id, n) {
	console.log("down", n);
	
	if (n == BUTTONS.CHANGE_VIEW) {
		// Connect
		console.log("test1") 
		for (var i = 0; i < numOfBolts; i++) {
			if (!bolts[i]) {
				console.log("test2") 
				bolts[i] = await Scanner.find(SpheroBolt.advertisement, boltNames[i]);
				console.log("test3") 
			}
			// bolts[i] = await Scanner.find(SpheroBolt.advertisement, boltNames[i]);
		}
	}
	else if (n == BUTTONS.MENU) {
		// Sleep and disconnect
		
		for (var i = 0; i < numOfBolts; i++) {
			if (bolts[i]) {
				
				//bolts[i].sleep();
				
			}
		}
		
	}
	else if (n == BUTTONS.A) {}
	else if (n == BUTTONS.B) {}
	else if (n == BUTTONS.X) {}
	else if (n == BUTTONS.Y) {}
	
});


// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

const trigger1 = new Gpio(23, {mode: Gpio.OUTPUT});
const echo1 = new Gpio(24, {mode: Gpio.INPUT, alert: true});
const echo2 = new Gpio(27, {mode: Gpio.INPUT, alert: true});
var distance1 = 0;
var distance2 = 0;

trigger1.digitalWrite(0); // Make sure trigger is low

const watchHCSR04 = () => {
  let startTick1;
  let startTick2; 	
	
  echo1.on('alert', (level1, tick1) => {
    if (level1 == 1) {
      startTick1 = tick1;
    } else {
      const endTick1 = tick1;
      const diff1 = (endTick1 >> 0) - (startTick1 >> 0); // Unsigned 32 bit arithmetic
      console.log("Ultraljud 1: ", diff1 / 2 / MICROSECDONDS_PER_CM);
      distance1 = diff1 / 2 / MICROSECDONDS_PER_CM;
  if (distance1 - distance2 > 10 && distance1 > 20 && distance1 < 50 && distance2 > 20 && distance2 < 50) {
    for (var i = 0; i < numOfBolts-2; i++) {
      if (bolts[i]) bolts[i].roll(80, 0, []);
    }	 		
  } 
  else if (distance2 - distance1 > 10 && distance1 > 20 && distance1 < 50 && distance2 > 20 && distance2 < 50) {
    for (var i = 2; i < numOfBolts; i++) {
      if (bolts[i]) bolts[i].roll(80, 0, []);
    }	 		
  }	
  else if (distance1 > 20 && distance1 < 50 && distance2 > 20 && distance2 < 50) {
    for (var i = 0; i < numOfBolts; i++) {
        if (bolts[i]) bolts[i].roll(80, 0, []);
      }	 
  }
    }
    
  });

  echo2.on('alert', (level2, tick2) => {
    if (level2 == 1) {
      startTick2 = tick2;
    } else {
      const endTick2 = tick2;
      const diff2 = (endTick2 >> 0) - (startTick2 >> 0); // Unsigned 32 bit arithmetic
      console.log("Ultraljud 2: ", diff2 / 2 / MICROSECDONDS_PER_CM);
      distance2 = diff2 / 2 / MICROSECDONDS_PER_CM;	
      if (distance1 - distance2 > 10 && distance1 > 20 && distance1 < 50 && distance2 > 20 && distance2 < 50) {
        for (var i = 0; i < numOfBolts-2; i++) {
          if (bolts[i]) bolts[i].roll(80, 0, []);
        }	 		
      } 
      else if (distance2 - distance1 > 10 && distance1 > 20 && distance1 < 50 && distance2 > 20 && distance2 < 50) {
        for (var i = 2; i < numOfBolts; i++) {
          if (bolts[i]) bolts[i].roll(80, 0, []);
        }	 		
      }	
      else if (distance1 > 20 && distance1 < 50 && distance2 > 20 && distance2 < 50) {
        for (var i = 0; i < numOfBolts; i++) {
            if (bolts[i]) bolts[i].roll(80, 0, []);
          }	 
      }
        }	
});
  	
	
};

watchHCSR04();

// Trigger a distance measurement once per second
setInterval(() => {
  trigger1.trigger(10, 1); // Set trigger high for 10 microseconds
}, 1000);