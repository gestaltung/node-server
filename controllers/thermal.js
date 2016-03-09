var Printer = require('thermalprinter');
var app = require('../app');
var five = require("johnny-five");


exports.printSummary = function(req, res) {
	// don't use app.serialPort.on('open')
	// or app.printer.on('ready')
	// make sure process.exit() from the example is deleted.
	console.log(req.body);

	if (!app.serialPort) {
		res.json({'status': 'no printer connected'});
		return;
	}

	if (app.serialPort.isOpen()) {
        app.printer
            .bold(true)
            .indent(0)
            .left()
            .printLine(req.body.name)
            .print(function() {
                console.log('done');
				res.json({'status': 'done'});
            });
	}
	else {
		res.json({'status': 'fail'});
	}
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