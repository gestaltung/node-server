/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var methodOverride = require('method-override');
var dotenv = require('dotenv');
var MongoStore = require('connect-mongo/es5')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var sass = require('node-sass-middleware');
var _ = require('lodash');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 *
 * Default path: .env
 */
dotenv.load({ path: '.env' });

/**
 * Controllers (route handlers).
 */
var summaryController = require('./controllers/summary');
var homeController = require('./controllers/home');
var signupController = require('./controllers/signup');
var twilioController = require('./controllers/twilio');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var movesController = require('./controllers/moves');
var authenticationController = require('./controllers/authentication');
var fitbitController = require('./controllers/fitbit');
var lastfmController = require('./controllers/lastfm');
var thermalController = require('./controllers/thermal');
var contactController = require('./controllers/contact');
var dashboardController = require('./controllers/dashboard');

/**
 * API keys and Passport configuration.
 */
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();

/**
 * Setup CORS
 */
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.send(200)
  }
  else {
    next()
  }
}

app.use(allowCrossDomain);

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB || process.env.MONGOLAB_URI);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Setup thermal printer
 */
var Printer = require('thermalprinter');
var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;

serialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    // if our device is connected, open serial port communication.
    if (port.comName === process.envSERIALPORT) {
      exports.serialPort = new SerialPort(process.env.SERIALPORT, {
         baudrate: process.env.BAUDRATE
      });

      exports.printer = new Printer(exports.serialPort);
    }
    else {
      console.log('no thermal printer connected');
    }
  });
});


/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  debug: true,
  sourceMap: true,
  outputStyle: 'expanded'
}));
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca({
  csrf: true,
  // csrf: false,
  xframe: 'SAMEORIGIN',
  xssProtection: true
}));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  if (/api/i.test(req.path)) {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


/**
 * Primary app routes.
 */
app.get('/landing', signupController.index);
app.get('/', homeController.index, passportConf.isAuthenticated);
app.post('/express_interest', signupController.postSubmitEmail);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);

/**
 * Account-related routes
 */
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

/**
 * Routes for linking accounts
 */
app.get('/link', passportConf.isAuthenticated, userController.getLink);
app.get('/link/lastfm', passportConf.isAuthenticated, userController.getUpdateLastfm);
app.post('/link/lastfm', passportConf.isAuthenticated, userController.postUpdateLastfm);

/**
 * Dashboard routes
 */
app.get('/dashboard', passportConf.isAuthenticated, dashboardController.getDailyDashboard);
app.get('/dashboard/custom', passportConf.isAuthenticated, dashboardController.getCustomDashboard);

/**
 * Authentication for other devices
 */
app.get('/api/authenticate', authenticationController.getTokens);

/**
 * API testing routes
 */
app.get('/test', passportConf.isAuthenticated, apiController.getApiTests);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/docs', apiController.getDocs);
app.get('/api/summary/daily', summaryController.getDailySummary);
// app.get('/api/lastfm/getRecentTracks', summaryController.getRecentTracks);
app.get('/api/lastfm/artists', lastfmController.getTopArtists);
// app.get('/api/lastfm', summaryController.getLastfm);
// app.get('/api/twilio', apiController.getTwilio);
// app.post('/api/twilio', apiController.postTwilio);
app.get('/api/foursquare', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFoursquare);
app.get('/api/twilio/printer', twilioController.smsToPrinter);

/**
 * Fitbit-Specific Routes.
 */
app.get('/api/fitbit/sleep', fitbitController.getSleepSummary);
// app.get('/api/fitbit/activity', fitbitController.getActivitySummary);
app.get('/api/fitbit/refresh', fitbitController.getFitbitRefreshToken);
app.get('/api/fitbit/profile', fitbitController.getFitbitProfile);

/**
 * Moves-Specific Routes.
 */
app.get('/api/moves/distance', movesController.getAggregatedDistance);
app.get('/api/moves/profile', passportConf.isAuthenticated, movesController.getMovesProfile);
app.get('/api/moves/summary', movesController.getSummaryByDateRange);
app.get('/api/moves/places', movesController.getPlacesByDateRange);

/**
 * Thermal printer & Serial communications with Arduino
 */
app.post('/api/thermal', thermalController.printSummary);
app.get('/api/blinkLED', thermalController.blinkLED);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
  res.redirect('/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

/**
 * OAuth authorization routes.
 */
app.get('/auth/fitbit', passport.authenticate('fitbit', {
  scope: ['activity', 'heartrate', 'location', 'profile', 'sleep']
  // session: true
}));
app.get('/auth/fitbit/callback', passport.authenticate('fitbit', { failureRedirect: '/link' }), function(req, res) {
  res.redirect('/');
});

app.get('/auth/moves', passport.authenticate('moves', {scope: ['default', 'activity', 'location']}));
app.get('/auth/moves/callback', passport.authenticate('moves', { failureRedirect: '/link' }), function(req, res) {
 res.redirect('/');
});

app.get('/auth/lastfm', passport.authenticate('lastfm'));
app.get('/auth/lastfm/callback', passport.authenticate('moves', { failureRedirect: '/link' }), function(req, res) {
  res.redirect('/');
});

app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/foursquare');
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});


module.exports = app;
