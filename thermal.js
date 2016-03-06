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
