/**
 * Split into declaration and initialization for better startup performance.
 */
var validator;
var cheerio;
var graph;
var LastFmNode;
var tumblr;
var foursquare;
var Github;
var Twit;
var paypal;
var ig;
var Y;
var fitbit;
var request;
var moment;

var _ = require('lodash');
var async = require('async');
var querystring = require('querystring');

/**
 * GET /api/docs
 * Lists documentation for API endpoints
 */
exports.getDocs = function(req, res) {
  var data = [];
  data.push({
    'path': '/api/docs',
    'description': 'This page',
    'parameters': ['bla', 'bla', 'bla']
  })
  res.json(data);
};

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = function(req, res) {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/foursquare
 * Foursquare API example.
 */
exports.getFoursquare = function(req, res, next) {
  foursquare = require('node-foursquare')({
    secrets: {
      clientId: process.env.FOURSQUARE_ID,
      clientSecret: process.env.FOURSQUARE_SECRET,
      redirectUrl: process.env.FOURSQUARE_REDIRECT_URL
    }
  });

  var token = _.find(req.user.tokens, { kind: 'foursquare' });
  async.parallel({
    trendingVenues: function(callback) {
      foursquare.Venues.getTrending('40.7222756', '-74.0022724', { limit: 50 }, token.accessToken, function(err, results) {
        callback(err, results);
      });
    },
    venueDetail: function(callback) {
      foursquare.Venues.getVenue('49da74aef964a5208b5e1fe3', token.accessToken, function(err, results) {
        callback(err, results);
      });
    },
    userCheckins: function(callback) {
      foursquare.Users.getCheckins('self', null, token.accessToken, function(err, results) {
        callback(err, results);
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/foursquare', {
      title: 'Foursquare API',
      trendingVenues: results.trendingVenues,
      venueDetail: results.venueDetail,
      userCheckins: results.userCheckins
    });
  });
};

/**
 * CRON Jobs will be defined here
 * This function will periodically merge all data produced by users
 * in their linked apps.
 *
 * For the time, include Moves, Last.fm, Weather.
 * Weather data will be gathered based on avg lat/lon data from Moves.
 */

/**
 * Daily Routines. Include merging all APIs and inserting into DB
 * @param {date} date Day for summary. Format is YYYYMMDD.
 */
exports.getDailySummary = function(req, res, next) {
  // Last.fm and Moves for now.
  // The last day will always be yesterday.
  // 
  // 
  request = require('request');
  LastFmNode = require('lastfm').LastFmNode;
  moment = require('moment');
  // console.log(req.user);
  // console.log(req.user);

  // return res.json(req.query);

  // Tokens and usernames
  var lastfm = new LastFmNode({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET
  });
  var lastfmUser = req.user.lastfm;
  var token = _.find(req.user.tokens, { kind: 'moves' });
  
  // Date stuff 
  var date;
  if (req.query.date) {
    date = moment(req.query.date, "YYYYMMDD").startOf('day');
  }
  else {
    // Else get yesterday's date
    // var yesterday = moment().add(-1, 'days').startOf('day');
    date = moment().add(-1, 'days').startOf('day');

  }

  var dateString = date.format('YYYYMMDD');
  console.log('requested date', dateString);

  // Moves info
  var baseUrl = 'https://api.moves-app.com/api/1.1/user';
  var query = querystring.stringify({
    'access_token': token.accessToken,
    'trackPoints': true
  });

  
  async.parallel({
    // movesPlaces: function(done) {

    //   var url = baseUrl + '/places/daily/' + dateString + '?' + query;
    //   console.log(url);
    //   request.get(url, function(err, request, body) {
    //     if (err) {
    //       return done(err);
    //     }
    //     if (request.statusCode === 403) {
    //       return next(Error('Missing or Invalid Moves API Key'));
    //     }
        
    //     return done(null, JSON.parse(body)[0]);
    //   })
    // },
    movesStoryline: function(done) {
      var baseUrl = 'https://api.moves-app.com/api/1.1/user';
      var query = querystring.stringify({
        'access_token': token.accessToken,
        'trackPoints': true
      });

      var url = baseUrl + '/storyline/daily/' + dateString + '?' + query;
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
    },
    lastfmScrobbles: function(done) {
      lastfm.request('user.getRecentTracks', {
        user: lastfmUser,
        limit: 100,
        from: date.unix(),
        to: date.add(1, 'day').unix(),
        handlers: {
          success: function(data) {
            var tracks = [];
            data = data.recenttracks.track
            // tracks = data;
            _.each(data, function(track) {
              tracks.push({
                artist: track.artist['#text'],
                name: track.name,
                album: track.album['#text'],
                image: track.image[2]['#text'] || null,
                date: track.date ? track.date.uts : null
              })
            })
            // for (t in data) {
            //   tracks.push({
            //     artist: data[t].artist["#text"] || null,
            //     name: data[t].name,
            //     album: data[t].album["#text"] || null,
            //     image: data[t].image[2]["#text"] || null,
            //     date: data[t].date ? data[t].date.uts : null
            //   })
            // }
            return done(null, tracks);
          },
          error: function(err) {
            console.log(err);
            done(err);
          }
        }
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

/**
 * GET /api/lastfm
 * Last.fm API example.
 */

exports.getRecentTracks = function(req, res, next) {
  request = require('request');
  LastFmNode = require('lastfm').LastFmNode;

  var lastfm = new LastFmNode({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET
  });

  async.parallel({
    topTracks: function(done) {
      lastfm.request('user.getRecentTracks', {
        user: req.user.lastfm,
        handlers: {
          success: function(data) {

            var tracks = [];
            _.each(data.recenttracks.track, function(track) {
              var t = {}
              t.artist = track.artist["#text"];
              t.name = track.name;
              t.album = track.album["#text"];
              if (track.date) {
                t.date = track.date["#text"];
              }
              else {
                t.date = "now";
              }
              
              tracks.push(t);
            });
            // done(null, data);
            done(null, tracks.slice(0,10));
          },
          error: function(err) {
            done(err);
            // res.json(err);
          }
        }
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err.message);
    }
    
    res.json(results);
  })
};

exports.getLastfm = function(req, res, next) {
  request = require('request');
  LastFmNode = require('lastfm').LastFmNode;

  var lastfm = new LastFmNode({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET
  });

  var userTopTracks = function(done) {
    lastfm.request('user.getWeeklyTrackChart', {
      user: req.user.lastfm,
      handlers: {
        success: function(data) {
          var tracks = [];
          _.each(data.toptracks.track, function(track) {
            tracks.push(track);
          });
          done(null, tracks.slice(0,10));
        },
        error: function(err) {
          done(err);
        }
      }
    });
  }

  async.parallel({
    artistInfo: function(done) {
      lastfm.request('artist.getInfo', {
        artist: 'Sonic Youth',
        handlers: {
          success: function(data) {
            done(null, data);
          },
          error: function(err) {
            done(err);
          }
        }
      });
    },
    artistTopTracks: function(done) {
      lastfm.request('artist.getTopTracks', {
        artist: 'Sonic Youth',
        handlers: {
          success: function(data) {
            var tracks = [];
            _.each(data.toptracks.track, function(track) {
              tracks.push(track);
            });
            done(null, tracks.slice(0,10));
          },
          error: function(err) {
            done(err);
          }
        }
      });
    },
    userTopTracks: function(done) {
      lastfm.request('user.getWeeklyTrackChart', {
        user: 'Zacoppotamus',
        handlers: {
          success: function(data) {
            var userTracks = [];
            _.each(data.weeklytrackchart.track, function(track) {
              userTracks.push(track);
            });
            console.log(userTracks.slice(0,2));
            done(null, userTracks.slice(0,10));
          },
          error: function(err) {
            done(err);
          }
        }
      });
    },
    artistTopAlbums: function(done) {
      lastfm.request('artist.getTopAlbums', {
        artist: 'Sonic Youth',
        handlers: {
          success: function(data) {
            var albums = [];
            _.each(data.topalbums.album, function(album) {
              albums.push(album.image.slice(-1)[0]['#text']);
            });
            done(null, albums.slice(0, 4));
          },
          error: function(err) {
            done(err);
          }
        }
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err.message);
    }
    var artist = {
      name: results.artistInfo.artist.name,
      image: results.artistInfo.artist.image.slice(-1)[0]['#text'],
      tags: results.artistInfo.artist.tags.tag,
      bio: results.artistInfo.artist.bio.summary,
      stats: results.artistInfo.artist.stats,
      similar: results.artistInfo.artist.similar.artist,
      topAlbums: results.artistTopAlbums,
      topTracks: results.artistTopTracks,
      userTracks: results.userTracks
    };

    // User's top tracks
    var tracks = {
      userTracks: results.userTracks
    };

    // console.log(artist.userTracks.weeklytrackchart.track)
    res.render('api/lastfm', {
      title: 'Last.fm API',
      artist: artist,
      tracks: tracks.userTracks
    });
  });
};

/**
 * GET /api/twitter
 * Twiter API example.
 */
exports.getTwitter = function(req, res, next) {
  Twit = require('twit');

  var token = _.find(req.user.tokens, { kind: 'twitter' });
  var T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.get('search/tweets', { q: 'nodejs since:2013-01-01', geocode: '40.71448,-74.00598,5mi', count: 10 }, function(err, reply) {
    if (err) {
      return next(err);
    }
    res.render('api/twitter', {
      title: 'Twitter API',
      tweets: reply.statuses
    });
  });
};


/**
 * GET /api/twilio
 * Twilio API example.
 */
exports.getTwilio = function(req, res) {
  twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

  res.render('api/twilio', {
    title: 'Twilio API'
  });
};

/**
 * POST /api/twilio
 * Send a text message using Twilio.
 */
exports.postTwilio = function(req, res, next) {
  req.assert('number', 'Phone number is required.').notEmpty();
  req.assert('message', 'Message cannot be blank.').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twilio');
  }

  var message = {
    to: req.body.number,
    from: '+13472235148',
    body: req.body.message
  };
  twilio.sendMessage(message, function(err, responseData) {
    if (err) {
      return next(err.message);
    }
    req.flash('success', { msg: 'Text sent to ' + responseData.to + '.'});
    res.redirect('/api/twilio');
  });
};

/**
 * GET /api/instagram
 * Instagram API example.
 */
exports.getInstagram = function(req, res, next) {
  ig = require('instagram-node').instagram();

  var token = _.find(req.user.tokens, { kind: 'instagram' });
  ig.use({ client_id: process.env.INSTAGRAM_ID, client_secret: process.env.INSTAGRAM_SECRET });
  ig.use({ access_token: token.accessToken });
  async.parallel({
    searchByUsername: function(done) {
      ig.user_search('richellemead', function(err, users, limit) {
        done(err, users);
      });
    },
    searchByUserId: function(done) {
      ig.user('175948269', function(err, user) {
        done(err, user);
      });
    },
    popularImages: function(done) {
      ig.media_popular(function(err, medias) {
        done(err, medias);
      });
    },
    myRecentMedia: function(done) {
      ig.user_self_media_recent(function(err, medias, pagination, limit) {
        done(err, medias);
      });
    }
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/instagram', {
      title: 'Instagram API',
      usernames: results.searchByUsername,
      userById: results.searchByUserId,
      popularImages: results.popularImages,
      myRecentMedia: results.myRecentMedia
    });
  });
};

/**
 * GET /api/yahoo
 * Yahoo API example.
 */
exports.getYahoo = function(req, res) {
  Y = require('yui/yql');

  Y.YQL('SELECT * FROM weather.forecast WHERE (location = 10007)', function(response) {
    var location = response.query.results.channel.location;
    var condition = response.query.results.channel.item.condition;
    res.render('api/yahoo', {
      title: 'Yahoo API',
      location: location,
      condition: condition
    });
  });
};
