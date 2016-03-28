var Signup = require('../models/Signup');

/**
 * GET /landing
 * Gets landing page/splash screen in order to gauge
 * user interest on the commercial aspect of the plan.
 */
exports.index = function(req, res) {
  res.render('landing', {
    title: 'Extempore'
  });
};

/**
 * GET
 * Users submit emails to express interest
 */
exports.postSubmitEmail = function(req, res) {
  req.assert('email', 'Email is not valid').isEmail();

  var ip = req.headers['x-forwarded-for'] || 
       req.connection.remoteAddress || 
       req.socket.remoteAddress ||
       req.connection.socket.remoteAddress;

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/landing');
  }

  Signup.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Email address already exists.'});
      return res.redirect('/landing');
    }
    else {
      var signup = new Signup();
      signup.email = req.body.email;
      signup.ip = ip;
      signup.save(function(err) {
        if (err) {
          req.flash('errors', { msg: 'Couldn\'t save email.' });
          return res.redirect('/landing');
        }
        else {
          var successMsg = ['Thanks for registering interest for',
          'the Extempore framework. You will be notified by email',
          'once the platform launches.'].join(' ');
          req.flash('success', { msg: successMsg });
          res.redirect('/landing');
        }
      })
    }
  })
}