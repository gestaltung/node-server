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
var signupController = require('./controllers/signup');
var sessionController = require('./controllers/sessions');
var authController = require('./controllers/auth');
var userController = require('./controllers/user');
var homeController = require('./controllers/home');
var apiController = require('./controllers/api');
var movesController = require('./controllers/moves');
var authenticationController = require('./controllers/authentication');
var fitbitController = require('./controllers/fitbit');
var lastfmController = require('./controllers/lastfm');
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
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
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
  csrf: false,
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

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.send(401);
  }
  else {
    next();
  }
};


/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.post('/express_interest', signupController.postSubmitEmail);

/**
 * Account-related routes
 */
app.post('/forgot', userController.postForgot);
// app.get('/reset/:token', userController.getReset);
// app.post('/reset/:token', userController.postReset);
app.post('/contact', contactController.postContact);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

/**
 * Routes for linking accounts
 */
app.post('/link/lastfm', passportConf.isAuthenticated, userController.postUpdateLastfm);

/**
 * Dashboard routes
 */


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
app.get('/api/docs', apiController.getDocs);
app.get('/api/summary/daily', summaryController.getDailySummary);
app.get('/api/lastfm/artists', lastfmController.getTopArtists);


/**
 * Fitbit-Specific Routes.
 */
app.get('/api/fitbit/sleep', fitbitController.getSleepSummary);
app.get('/api/fitbit/refresh', fitbitController.getFitbitRefreshToken);
app.get('/api/fitbit/profile', fitbitController.getFitbitProfile);

/**
 * Moves-Specific Routes.
 */
app.get('/api/moves/distance', movesController.getAggregatedDistance);
app.get('/api/moves/profile', passportConf.isAuthenticated, movesController.getMovesProfile);
app.get('/api/moves/summary', movesController.getSummaryByDateRange);

/**
 * OAuth authentication routes. (Sign in)
 * and Session routes
 */
app.post('/auth/signup', userController.postSignup);
app.post('/auth/session', userController.postLogin);
app.del('/auth/session', userController.logout);
app.get('/auth/session', passportConf.isAuthenticated, sessionController.session);
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
  res.redirect('/');
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
