/**
 * GET /api/twilio/printer
 *
 * Receives a notification from Twilio API when the user sends a message.
 * and based on the URL for the thermal CLI app will ping it.
 * @param  {telephhone} req [Phone number for incoming SMS]
 */
exports.smsToPrinter = function(req, res) {
  console.log('pinged from twilio');
  res.status(200).send({
    'status': 'ok'
  });
}
