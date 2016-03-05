var SerialPort = require("serialport").SerialPort
// var serialPort = new SerialPort("/dev/tty-usbserial1", {
//   baudrate: 57600
// });
var five = require("johnny-five");


exports.printSummary = function(req, res) {
	var SerialPort = require('serialport').SerialPort,
	    serialPort = new SerialPort('/dev/cu.usbmodemFA131', {
	        baudrate: 19200
	    }),
	    Printer = require('thermalprinter');

	serialPort.on('open',function() {
	    var printer = new Printer(serialPort);
	    printer.on('ready', function() {
	        printer
	            .indent(10)
	            .horizontalLine(16)
	            .bold(true)
	            .indent(10)
	            .printLine('first line')
	            .bold(false)
	            .inverse(true)
	            .big(true)
	            .right()
	            .printLine('second line')
	            .print(function() {
                console.log('done');
                process.exit();
	            });
	    });
	});

	res.json({'status': 'done'});
}

// Make sure Arduino interface is working
exports.blinkLED = function(req, res) {
	var delay = req.query.delay || 500;
	console.log('delay', delay);

	if (req.query.board) {
		var board = new five.Board({
		  port: '/dev/'+req.query.board,
		  repl: false
		});
	}
	else {
		var board = new five.Board({
			repl: false
		});
	}

	function blinkLED() {
	  // Create an Led on pin 13

		board.on("ready", function() {
			var led = new five.Led(13);
		  // Blink every half second
		  led.blink(delay); 
		})
	}

	blinkLED();
	res.json({'status':'ok'});	
}