var request;

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var querystring = require('querystring');


/**
 * GET /api/moves/docs
 * Lists documentation for Moves API endpoints
 */
exports.getDocs = function(req, res) {
  var data = [];
  data.push({
    'path': '/api/moves/docs',
    'description': 'This page',
    'parameters': ['bla', 'bla', 'bla']
  })
  res.json(data);
};

/**
 * GET /api/moves/profile
 */
exports.getMovesProfile = function(req, res, next) {
  request = require('request');
  var token = _.find(req.user.tokens, { kind: 'moves' });


  var query = querystring.stringify({
    'access_token': token.accessToken
  });
  var url = 'https://api.moves-app.com/api/1.1/user/profile?' + query;

  request.get(url, function(err, request, body) {
    if (err) {
      return next(err);
    }
    if (request.statusCode === 403) {
      return next(Error('Missing or Invalid Moves API Key'));
    }
    // console.log(JSON.parse(body));
    res.json(JSON.parse(body));
    // res.render('api/moves', {
    //   data: JSON.parse(body)
    // })
  })
}

/**
 * GET /api/moves/distance
 *
 * @param {date} [date] [in YYYYMMDD format]
 *
 * Returns distance in km and duration in mins.
 *
 * TO DO: Server crashes when wrong access token is provided
 */
exports.getAggregatedDistance = function(req, res) {
	request = require('request');
	var baseUrl = 'https://api.moves-app.com/api/1.1/user';
	var token, userID;

	// OpenFrameworks won't have tokens in request.
	try {
		token = _.find(req.user.tokens, { kind: 'moves' });
		userID = req.user.moves;
	}
	catch(err) {
    // OpenFrameworks won't have tokens in request.
    console.log('Request made from OF');
	}


	// Date stuff
	var date;
	if (req.query.date) {
	  date = moment(req.query.date, "YYYYMMDD").startOf('day');
	}
	else {
	  // Else get yesterday's date
	  date = moment().add(-1, 'days').startOf('day');
	}
	var dateString = date.format('YYYYMMDD');

	var query = querystring.stringify({
	  'access_token': req.query.access_token || token.accessToken
	});

	var url = baseUrl + '/activities/daily/' + dateString + '?' + query;
	request.get(url, function(err, request, body) {
		if (err) {
			res.send(err);
			return;
		}

		if (res.status === 401) {
			res.send('Missing or invalid Moves API Key');
			return;
		}

		var data = JSON.parse(body)[0];

		var output = {};
		output.date = dateString;
		output.walking = {};
		output.transport = {};

		output.distance = _.sum(_.map(data.summary, function(d) {
			return d.distance/1000 || 0;
		}));

		output.totalSteps = _.sum(_.map(data.summary, function(d) {
			return d.steps || 0;
		}));

		output.walking.duration = Math.floor(_.sum(_.map(data.summary, function(d) {
			if (d.activity === 'walking') {
				return d.duration || 0;
			}

			return 0;
		}))/60);

		output.walking.distance = _.sum(_.map(data.summary, function(d) {
			if (d.activity === 'walking') {
				return d.distance/1000 || 0;
			}

			return 0;
		}));

		output.transport.duration = Math.floor(_.sum(_.map(data.summary, function(d) {
			if (d.activity === 'transport') {
				return d.duration || 0;
			}

			return 0;
		}))/60);

		output.transport.distance = _.sum(_.map(data.summary, function(d) {
			if (d.activity === 'transport') {
				return d.distance/1000 || 0;
			}

			return 0;
		}));

		return res.json(output);
	});
}

/**
 * GET /api/moves/summary
 *
 * @param {start date} [from] [in YYYYMMDD format]
 * @param {end date} [to] [in YYYYMMDD format]
 * @param {date date} [date] [YYYYMMDD — Optional]
 *
 * Returns activity summary for specified date range
 *
 * TO DO: Make sure end date of range isn't in the future
 * Can abstract date ranges into middleware
 */
exports.getSummaryByDateRange = function(req, res) {
  request = require('request');

  var baseUrl = 'https://api.moves-app.com/api/1.1/user/summary/daily';

  var token, userID, range, startDate, url, from, to, date;
  var query;

  // OpenFrameworks won't have tokens in request.
  // Instead it will be hardcoded in the request.
  try {
    token = _.find(req.user.tokens, { kind: 'moves' });
    userID = req.user.moves;
  }
  catch(err) {
    token = req.query.access_token;
    // res.status(400).send(err);
  }

  if (req.query.from && req.query.to) {
    from = req.query.from;
    to = req.query.to;
    query = querystring.stringify({
      'from': from,
      'to': to,
      'access_token': req.query.access_token || token.accessToken
    });
  }
  else if(req.query.date) {
    date = req.query.date;
    query = querystring.stringify({
      'access_token': req.query.access_token || token.accessToken
    });
  }
  else {
    res.status(400).send({
      'status': 'err',
      'msg': 'Start and/or end date not provided'
    });
  }

  console.log('reached here');

  url = baseUrl + '?' + query;
  console.log(url);
  request.get(url, function(err, request, body) {
    if (err) {
      res.send(err);
    }

    var data = JSON.parse(body);

    return res.json(data);
  })

  // res.send({});
}

/**
 * GET /api/moves/places
 *
 * @param {start date} [from] [in YYYYMMDD format]
 * @param {end date} [to] [in YYYYMMDD format]
 * @param {date date} [date] [YYYYMMDD — Optional]
 *
 * Returns places summary for specified date range
 *
 * TO DO: Make sure end date of range isn't in the future
 */
exports.getPlacesByDateRange = function(req, res) {
  request = require('request');

  var baseUrl = 'https://api.moves-app.com/api/1.1/user/places/daily';

  var token, userID, range, startDate, url, from, to, date;
  var query;

  // OpenFrameworks won't have tokens in request.
  // Instead it will be hardcoded in the request.
  try {
    token = _.find(req.user.tokens, { kind: 'moves' });
    userID = req.user.moves;
  }
  catch(err) {
    res.status(400).send(err);
  }

  if (req.query.from && req.query.to) {
    from = req.query.from;
    to = req.query.to;
    query = querystring.stringify({
      'from': from,
      'to': to,
      'access_token': req.query.access_token || token.accessToken
    });
  }
  else if(req.query.date) {
    date = req.query.date;
    query = querystring.stringify({
      'access_token': req.query.access_token || token.accessToken
    });
  }
  else {
    res.status(400).send({
      'status': 'err',
      'msg': 'Start and/or end date not provided'
    });
  }

  console.log('reached here');

  url = baseUrl + '?' + query;
  console.log(url);
  request.get(url, function(err, request, body) {
    if (err) {
      res.send(err);
    }

    var data = JSON.parse(body);

    return res.json(data);
  })
}



















