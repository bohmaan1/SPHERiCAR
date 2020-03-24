const Gpio = require('pigpio').Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

const trigger1 = new Gpio(23, {mode: Gpio.OUTPUT});
const echo1 = new Gpio(24, {mode: Gpio.INPUT, alert: true});

const trigger2 = new Gpio(17, {mode: Gpio.OUTPUT});
const echo2 = new Gpio(27, {mode: Gpio.INPUT, alert: true});

trigger1.digitalWrite(0); // Make sure trigger is low
trigger2.digitalWrite(0);	

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
};

watchHCSR04();

// Trigger a distance measurement once per second
setInterval(() => {
  trigger1.trigger(10, 1); // Set trigger high for 10 microseconds
  trigger2.trigger(10, 1); // Set trigger high for 10 microseconds		
}, 1000);