const { Scanner, Utils, SpheroBolt } = require("spherov2.js");
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
 

const boltNames = ["SB-AE48"/*, "SB-5AEB"*/];
const numOfBolts = boltNames.length;

/*
 * Max speed can be set to anything between 0 - 255.
 * Max speed of the Bolt is 2 m/s which should respond to value 255.
 */
const maxSpeed = 120;

var bolts = Array(numOfBolts);

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

setInterval(function() {
	var controller = gamepad.deviceAtIndex(0);
	
	for (var i = 0; i < numOfBolts; i++) {
		if (controller) {
			// Print entire controller (for debugging)
			//console.log(controller);
			
			var x = controller.axisStates[3*i + 0];
			var y = controller.axisStates[3*i + 1];
			
			/*
			 * Allow for a dead zone in the center as
			 * controllers can be giving small values
			 * when resting (due to bad calibration).
			 */
			if (Math.abs(x) < 0.1) x = 0;
			if (Math.abs(y) < 0.1) y = 0;
			
			var speed = Math.trunc(Math.sqrt(x*x+y*y) * maxSpeed);
			var angle = Math.trunc((Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360);
			
			// Print (x, y) values (for debugging)
			//console.log("(" + x + ", " + y + ")");
			
			// Send roll command to all bolts
			//for (var i = 0; i < numOfBolts; i++) if (bolts[i]) bolts[i].roll(speed, angle, []);
			if (bolts[i]) bolts[i].roll(speed, angle, []);
		}
	}
	
}, 50);
