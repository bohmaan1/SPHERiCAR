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

const boltNames = ["SB-5AEB"];
const numOfBolts = boltNames.length;

/*
 * Max speed can be set to anything between 0 - 255.
 * Max speed of the Bolt is 2 m/s which should respond to value 255.
 */
const maxSpeed = 120;

var bolts = Array(numOfBolts);

var a_count = 0;
var b_count = 0;
var x_count = 0;
var y_count = 0;
var interval = null;
var interval2 = null;

gamepad.on("down", async function (id, n) {
    console.log("down", n);

    if (n == BUTTONS.CHANGE_VIEW) {
        // Connect
        console.log("Attempting to connect " + boltNames.length + " Sphero Bolts");
        for (var i = 0; i < numOfBolts; i++) {
            if (!bolts[i]) {
                console.log("Connecting Sphero bolt: " + (i + 1));
                bolts[i] = await Scanner.find(SpheroBolt.advertisement, boltNames[i]);
                console.log("Connected Sphero Bolt: " + (i + 1));
            }
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

    // Manual steering
    else if (n == BUTTONS.A) {
        if (bolts[i]) {
            if ((a_count % 2) == 0) {
                interval2 = setInterval(steering, 50);
                console.log("Manual steering on")
                a_count++;
            }
            if ((a_count % 2) == 1) {
                clearInterval(interval2)
                console.log("Manual steering off")
                a_count++;
            }
        }
    }


    // Anti-collision
    else if (n == BUTTONS.B) {
        if ((b_count % 2) == 0) {
            interval = setInterval(collision, 1000);
            console.log("Anti-collision on");
            b_count++;
        }
        if ((b_count % 2) == 1) {
            clearInterval(interval);
            console.log("Anti-collision off");
            b_count++;
        }
    }

    // Follow-the-leader
    else if (n == BUTTONS.X) {
        if ((x_count % 2) == 0) {
            interval = setInterval(collision, 1000);
            console.log("Follow-the-leader on");
            x_count++;
        }
        if ((x_count % 2) == 1) {
            clearInterval(interval);
            console.log("Follow-the-leader off");
            x_count++;
        }
    }
    else if (n == BUTTONS.Y) { }

});

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6 / 34321;

const trigger1 = new Gpio(23, { mode: Gpio.OUTPUT });
const echo1 = new Gpio(24, { mode: Gpio.INPUT, alert: true });
const echo2 = new Gpio(27, { mode: Gpio.INPUT, alert: true });
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

            // Anti-collision
            if ((distance1 < 10 || distance2 < 10) && (b_count % 2) == 1) {
                for (var i = 0; i < numOfBolts; i++) {
                    if (bolts[i]) bolts[i].roll(0, 0, []);
                }
            }
            else if ((b_count % 2) == 1) {
                for (var i = 0; i < numOfBolts; i++) {
                    if (bolts[i]) bolts[i].roll(80, 0, []);
                }
            }

            // Follow the leader
            else if (distance1 - distance2 > 10 && distance1 > 20 && distance1 < 50 && distance2 > 20 && distance2 < 50 && (x_count % 2) == 1) {
                for (var i = 0; i < numOfBolts - 2; i++) {
                    if (bolts[i]) bolts[i].roll(255, 0, []);
                }
                for (var i = 2; i < numOfBolts; i++) {
                    if (bolts[i]) bolts[i].roll(80, 0, []);
                }
            }
            else if (distance2 - distance1 > 10 && distance1 > 20 && distance1 < 50 && distance2 > 20 && distance2 < 50 && (x_count % 2) == 1) {
                for (var i = 2; i < numOfBolts; i++) {
                    if (bolts[i]) bolts[i].roll(255, 0, []);
                }
                for (var i = 0; i < numOfBolts - 2; i++) {
                    if (bolts[i]) bolts[i].roll(80, 0, []);
                }
            }
            else if (distance1 > 20 && distance1 < 50 && distance2 > 20 && distance2 < 50 && (x_count % 2) == 1) {
                for (var i = 0; i < numOfBolts; i++) {
                    if (bolts[i]) bolts[i].roll(255, 0, []);
                }
            }
        }
    });
};

watchHCSR04();

function steering() {
    var controller = gamepad.deviceAtIndex(0);


    for (var i = 0; i < numOfBolts; i++) {
        if (controller) {
            // Print entire controller (for debugging)
            //console.log(controller);

            var x = controller.axisStates[0];
            var y = controller.axisStates[1];

			/*
			 * Allow for a dead zone in the center as
			 * controllers can be giving small values
			 * when resting (due to bad calibration).
			 */
            if (Math.abs(x) < 0.1) x = 0;
            if (Math.abs(y) < 0.1) y = 0;

            var speed = Math.trunc(Math.sqrt(x * x + y * y) * maxSpeed);
            var angle = Math.trunc((Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360);

            // Print (x, y) values (for debugging)
            //console.log("(" + x + ", " + y + ")");

            // Send roll command to all bolts
            //for (var i = 0; i < numOfBolts; i++) if (bolts[i]) bolts[i].roll(speed, angle, []);
            if (bolts[i]) bolts[i].roll(speed, angle, []);
        }
    }
}

function trigger() {
    trigger1.trigger(10, 1); // Set trigger high for 10 microseconds
}