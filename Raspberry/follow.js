const { Scanner, Utils, SpheroBolt } = require("spherov2.js");
const Gpio = require('pigpio').Gpio;

gamepad.init(); 							// Initialize the library
setInterval(gamepad.processEvents, 16); 	// Create a game loop and poll for events
setInterval(gamepad.detectDevices, 5000);	// Scan for new gamepads as a slower rate

// Initiera bollarna
const boltNames = ["SB-5AEB"];  /* first two bolts it the bolts to the right, the last two is the bolts to the left*/
const numOfBolts = boltNames.length;
var bolts = Array(numOfBolts);

/*
 * Max speed can be set to anything between 0 - 255.
 * Max speed of the Bolt is 2 m/s which should respond to value 255.
 */
var maxSpeed = 120;

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
    }
  });

  echo2.on('alert', (level2, tick2) => {
    if (level2 == 1) {
      startTick2 = tick2;
    } else {
      const endTick2 = tick2;
      const diff2 = (endTick2 >> 0) - (startTick2 >> 0); // Unsigned 32 bit arithmetic
      console.log("Ultraljud 2: ", diff2 / 2 / MICROSECDONDS_PER_CM);
    }
  });

  var right_sensors = diff1 / 2 / MICROSECDONDS_PER_CM
  var left_sensors = diff2 / 2 / MICROSECDONDS_PER_CM
  if ((right_sensors + left_sensors)/2 > 40) { /* 40 must eventually change after testing */
  	 maxSpeed *= 1.2; /* 1.2 must eventually change after testing */  		
  }
  else if ((right_sensors + left_sensors)/2 < 10) { /* 40 must eventually change after testing */
  	 maxSpeed *= 0.8; /* 1.2 must eventually change after testing */
  }
  else  { 
  	 maxSpeed = 120; /* 1.2 must eventually change after testing */
  }; 

  if (right_sensors > left_sensors + 5) {
    for (var i = 0; i < 2; i++) {
      if (bolts[i]) bolts[i].roll(maxSpeed*1.2, 0, []); //1.2 must eventually change after testing
    }	 		
  } 

  else if (right_sensors + 5 < left_sensors) {  /* 5 must eventually change after testing */
    for (var i = 3; i < 4; i++) {
      if (bolts[i]) bolts[i].roll(maxSpeed*1.2, 0, []); //1.2 must eventually change after testing
    }	
  }

  else {  
    for (var i = 0; i < numOfBolts; i++) {
      if (bolts[i]) bolts[i].roll(maxSpeed, 0, []); 
    }	
  };

watchHCSR04();

// Trigger a distance measurement once per second
setInterval(() => {
  trigger1.trigger(10, 1); // Set trigger high for 10 microseconds
}, 1000);