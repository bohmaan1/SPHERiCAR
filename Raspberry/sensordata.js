
// This is a big question, is this even how you import compared to the example? 
const { Event, Scanner, Utils, SpheroBolt,ICommandWithRaw, RollableToy} = require("spherov2.js"); 

const gamepad = require("gamepad");
 
gamepad.init();					
setInterval(gamepad.processEvents, 16); 	
setInterval(gamepad.detectDevices, 5000);	

const BUTTONS = {
	A: 0,
	B: 1,
	X: 2,
	Y: 3,
	CHANGE_VIEW: 6,
	MENU: 7
};
 
const boltNames = ["SB-C7AA" /*"SB-AE48", "SB-5AEB", "SB-048E"*/];
const numOfBolts = boltNames.length;

var bolts = Array(numOfBolts);

gamepad.on("down", async function(id, n) {
	console.log("down", n);
	
	// This works fine 
	if (n == BUTTONS.CHANGE_VIEW) { 
		for (var i = 0; i < numOfBolts; i++) {
			if (!bolts[i]) {
				console.log("Attempt to connect") 
				bolts[i] = await Scanner.find(SpheroBolt.advertisement, boltNames[i]);
				console.log("Connected") 
			}
		}
	}

	else if (n == BUTTONS.MENU) {}
	
	// Here's the problem, this doesn't work 
	else if (n == BUTTONS.A) {
		for(var i = 0; i < numOfBolts; i++) {
		    bolts[i].configureSensorStream();
	        /*  bolts[i].on(Event.onSensor, (command: ICommandWithRaw) => {
		 * 	console.log('onSensor', command);
		 *  });
		 */ 
		}
		 	
	}
	else if (n == BUTTONS.B) {}
	else if (n == BUTTONS.X) {}
	else if (n == BUTTONS.Y) {}
	
});

