var fitbit;
var request;

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var querystring = require('querystring');

var User = require('../models/User');

/**
 * GET /api/fitbit/docs
 * Lists documentation for Fitbit API endpoints
 */
exports.getDocs = function(req, res) {
  var data = [];
  data.push({
    'path': '/api/fitbit/docs',
    'description': 'This page',
    'parameters': ['bla', 'bla', 'bla']
  })
  res.json(data);
};

/**
 * GET /api/fitbit/profile
 */
exports.getFitbitProfile = function(req, res, next) {
  fitbit = require("fitbit-node");
  request = require('request');

  var token = _.find(req.user.tokens, { kind: 'fitbit' });
  var userID = req.user.fitbit;

  var query = querystring.stringify({
    'access_token': token.accessToken
  });

  var options = {
    url: 'https://api.fitbit.com/1/user/'+userID+'/sleep/date/2016-03-10.json?' + query,
    headers: {
      'Authorization': 'Bearer ' + token.accessToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  request.get(options, function(err, request, body) {
    if (err) {
      res.send(err);
    }

    res.json(JSON.parse(body));
  })
}

/**
 * GET /api/fitbit/sleep
 *
 * @param {date} [date] [in YYYYMMDD format]
 */
exports.getSleepSummary = function(req, res, next) {
  request = require('request');
  var token = _.find(req.user.tokens, { kind: 'fitbit' });
  var userID = req.user.fitbit;
  console.log('sleep date: ', req.query.date);

  if (!req.query.date) {
    date = moment().format('YYYY-MM-DD');
  }
  else {
    date = moment(req.query.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
  }

  var query = querystring.stringify({
    'access_token': token.accessToken
  });

  var options = {
    url: 'https://api.fitbit.com/1/user/'+userID+'/sleep/date/'+date+'.json?' + query,
    headers: {
      'Authorization': 'Bearer ' + token.accessToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  request.get(options, function(err, request, body) {
    if (err) {
      res.send(err);
    }

    res.json(JSON.parse(body));
  })
}

/**
 * GET /api/fitbit/activity
 *
 * @param {date} [date] [in YYYYMMDD format]
 */
exports.getActivitySummary = function(req, res, next) {
  request = require('request');
  var token = _.find(req.user.tokens, { kind: 'fitbit' });
  var userID = req.user.fitbit;
  console.log('sleep date: ', req.query.date);

  if (!req.query.date) {
    date = moment().format('YYYY-MM-DD');
  }
  else {
    date = moment(req.query.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
  }

  var query = querystring.stringify({
    'access_token': token.accessToken
  });

  var options = {
    url: 'https://api.fitbit.com/1/user/'+userID+'/activities/date/'+date+'.json?' + query,
    headers: {
      'Authorization': 'Bearer ' + token.accessToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  request.get(options, function(err, request, body) {
    if (err) {
      res.send(err);
    }

    res.json(JSON.parse(body));
  })
}

/**
 * GET /api/fitbit/refresh
 *
 * Refreshes access token for oAuth2
 */
exports.getFitbitRefreshToken = function(req, res, next) {
  request = require('request');
  var token = _.find(req.user.tokens, { kind: 'fitbit' });
  var userID = req.user.fitbit;


  var query = querystring.stringify({
    'grant_type': 'refresh_token',
    'refresh_token': token.refreshToken
    // 'scope': 'activity heartrate location profile sleep'
  });

  // convert client id / secret to base 64
  var encodedString = new Buffer(process.env.FITBIT_CLIENT_ID+':'+process.env.FITBIT_CLIENT_SECRET).toString('base64');

  var options = {
    url: 'https://api.fitbit.com/oauth2/token?' + query,
    headers: {
      'Authorization': 'Basic ' + encodedString,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  request.post(options, function(err, request, body) {
    if (err) {
      res.send(err);
    }

    var response = JSON.parse(body);

    // Update access and refresh tokens
    User.findById(req.user.id, function(err, user) {
      var tokenIndex = _.findIndex(user.tokens, { kind: 'fitbit' });
      if (tokenIndex != -1) {
        console.log('token already exists')
        user.tokens[tokenIndex].accessToken = response.access_token;
        user.tokens[tokenIndex].refreshToken = response.refresh_token;
      }

      user.save(function(err) {
        if(err) {
          console.log(err);
        }
      });
    });

    res.json(JSON.parse(body));
  })
}
