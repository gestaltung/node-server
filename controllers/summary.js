var LastFmNode;
var fitbit;
var request;
var moment;

var _ = require('lodash');
var async = require('async');
var querystring = require('querystring');

/**
 * Daily Routines. Include merging all APIs and inserting into DB
 * @param {date - YYYYMMDD} [date] [date]
 */
exports.getDailySummary = function(req, res, next) {
  // Last.fm and Moves for now.
  // The last day will always be yesterday.
  request = require('request');
  moment = require('moment');
  var token = _.find(req.user.tokens, { kind: 'moves' });

  // Date stuff
  var date;
  if (req.query.date) {
    date = moment(req.query.date, "YYYYMMDD").startOf('day');
  }
  else {
    // Else get yesterday's date
    date = moment().add(-1, 'days').startOf('day');

  }

  console.log('requested date', date.format('YYYYMMDD'));

  // Moves info
  var baseUrl = 'https://api.moves-app.com/api/1.1/user';
  var query = querystring.stringify({
    'access_token': token.accessToken,
    'trackPoints': true
  });


  async.parallel({
    movesStoryline: function(done) {
      var baseUrl = 'https://api.moves-app.com/api/1.1/user';
      var query = querystring.stringify({
        'access_token': token.accessToken,
        'trackPoints': true
      });

      var url = baseUrl + '/storyline/daily/' + date.format('YYYYMMDD') + '?' + query;
      request.get(url, function(err, request, body) {
        if (err) {
          return done(err);
        }
        if (request.statusCode === 403) {
          return next(Error('Missing or Invalid Moves API Key'));
        }

        var data = JSON.parse(body)[0];
        var output = {};
        var segments = [];

        try {
          output.summary = data.summary;
        }
        catch(e) {
          // TypeError, meaning no data for that date
          return done(null, segments);
        }

        for (s in data.segments) {
          var segment = data.segments[s];
          var newSegment = {};
          newSegment.startTime = segment.startTime;
          newSegment.endTime = segment.endTime;

          if (segment.type === "place") {
            newSegment.type = "place";
            newSegment.place = segment.place.name || "unknown";
            newSegment.location = segment.place.location;
          }
          else {
            newSegment.type = "move";
            try {
              newSegment.activity = segment.activities[0].activity; // will only include name of 1st activity
            }
            catch(e) {
              // Default to walking (doesn't matter much now)
              newSegment.activity = "walking";
            }
            var duration = 0;
            var distance = 0;
            var steps = 0;
            var trackPoints;
            _.each(segment.activities, function(seg) {
              trackPoints = seg.trackPoints;
              distance += seg.distance;
              duration += seg.duration;
              steps += seg.steps;
            })

            newSegment.distance = distance;
            newSegment.duration = duration;
            newSegment.steps = steps;
            newSegment.trackPoints = trackPoints;
          }

          segments.push(newSegment);
        }

        return done(null, segments);
      })
    }
  },
  function(err, results) {
    if (err) {
      return next(err.message);
    }

    res.json(results);
  });
}

exports.getWeeklySummary = function(req, res, next) {

}
