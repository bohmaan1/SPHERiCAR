const { Event, Scanner, Utils, SpheroBolt,ICommandWithRaw, RollableToy} = require("spherov2.js");
//const { Scanner, Utils, SpheroBolt} = require("spherov2.js");
const gamepad = require("gamepad");
//import { Event, Utils, ICommandWithRaw, RollableToy } from 'spherov2.js';

 
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
 

const boltNames = ["SB-C7AA", "SB-AE48" /*"SB-5AEB"*/];
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
	else if (n == BUTTONS.A) {
		for(var i = 0; i < numOfBolts; i++) {
		    bolts[i].configureSensorStream();
		 /* bolts[i].on(Event.onSensor, (command: ICommandWithRaw) => {
		 * 	console.log('onSensor', command);
		 *  });
		 */ 
		}
		 	
	}
	else if (n == BUTTONS.B) {
		/*for(var i = 0; i < numOfBolts; i++) {
		    *bolts[i] = await RollableToy.configureSensorStream();
		 *		}
*/
	}
	else if (n == BUTTONS.X) {}
	else if (n == BUTTONS.Y) {}
	
});

setInterval(function() {
	var controller = gamepad.deviceAtIndex(0);

	for (var i = 0; i < numOfBolts; i++) {
		if (controller) {
			// Print entire controller (for debugging)
			//console.log(controller);
			
			var x_left = controller.axisStates[0];
			var y_left = controller.axisStates[1];
			var x_right = controller.axisStates[3]; 	
			var y_right = controller.axisStates[4];
 			
			/*
			 * Allow for a dead zone in the center as
			 * controllers can be giving small values
			 * when resting (due to bad calibration).
			 */

			if (Math.abs(x_left) < 0.25) x_left = 0;
			if (Math.abs(y_left) < 0.25) y_left = 0;
			if (Math.abs(x_right) < 0.25) x_right = 0;
			if (Math.abs(y_right) < 0.25) y_right = 0;
			
	
			var speed = Math.trunc(Math.sqrt(x_left*x_left+y_left*y_left) * maxSpeed);
			//var angle = Math.trunc((Math.atan2(y_left, x_left) * 180 / Math.PI + 90 + 360) % 360);

			// Send roll command to all bolts
			if (bolts[i]) { 
				var angle_left = 0; 	
				var angle_right = 0;
				if (Math.abs(x_left) > 0 || Math.abs(y_left) > 0) {  
				angle_left = Math.trunc((Math.atan2(y_left, x_left) * 180 / Math.PI + 90 + 360) % 360);
				}
				if (Math.abs(x_right) > 0) {			
					if (x_right > 0) {
						angle_right += 90*i-10;   			
					} 
					if (x_right < 0) {
						angle_right += 90*i+10;
					} 
				}  
				var angle = (angle_left + angle_right) % 360; 
				bolts[i].roll(speed, angle, []);
			}
		}
	}
	
}, 500);
