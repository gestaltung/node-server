var LastFmNode;
var fitbit;
var request;
var moment;

var _ = require('lodash');
var async = require('async');
var querystring = require('querystring');

/**
 * Get favorite artists for the given date range.
 * Output will be artist and number of times they've been played.
 * Maximum date range is one month.
 *
 * @param {date - YYYYMMDD} [from] [start date]
 * @param {date - YYYYMMDD} [to] [end date]
 */
exports.getTopArtists = function(req, res, next) {
  request = require('request');
  LastFmNode = require('lastfm').LastFmNode;
  moment = require('moment');

  if (!(req.query.from && req.query.to)) {
    res.status(400).send({
      'status': 'err',
      'details': 'Date range not specified.'
    });
  }

  // Tokens and usernames
  var lastfm = new LastFmNode({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET
  });
  var lastfmUser = req.user.lastfm;

  // Date stuff
  var date;
  if (req.query.date) {
    date = moment(req.query.date, "YYYYMMDD").startOf('day');
  }
  else {
    // Else get yesterday's date
    date = moment().add(-1, 'days').startOf('day');

  }

  lastfm.request('user.getWeeklyArtistChart', {
    user: req.user.lastfm,
    from: moment(req.query.from, 'YYYYMMDD').unix(),
    to: moment(req.query.to, 'YYYYMMDD').unix(),
    handlers: {
      success: function(data) {
        data = data.weeklyartistchart.artist;
        var output = [];
        _.each(data, function(artist) {
          output.push({
            artist: artist["name"],
            playcount: artist["playcount"]
          });
        });

        res.json(output);
      },
      err: function(err) {
        res.status(500).send({
          'status': 'err',
          'details': 'Bad response from external API.'
        });
      }
    }
  })
}
