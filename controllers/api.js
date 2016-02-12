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

var _ = require('lodash');
var async = require('async');
var querystring = require('querystring');

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
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = function(req, res, next) {
  graph = require('fbgraph');

  var token = _.find(req.user.tokens, { kind: 'facebook' });
  graph.setAccessToken(token.accessToken);
  async.parallel({
    getMe: function(done) {
      graph.get(req.user.facebook + "?fields=id,name,email,first_name,last_name,gender,link,locale,timezone", function(err, me) {
        done(err, me);
      });
    },
    getMyFriends: function(done) {
      graph.get(req.user.facebook + '/friends', function(err, friends) {
        done(err, friends.data);
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/facebook', {
      title: 'Facebook API',
      me: results.getMe,
      friends: results.getMyFriends
    });
  });
};

/**
 * GET /api/scraping
 * Web scraping example using Cheerio library.
 */
exports.getScraping = function(req, res, next) {
  cheerio = require('cheerio');
  request = require('request');

  request.get('https://news.ycombinator.com/', function(err, request, body) {
    if (err) {
      return next(err);
    }
    var $ = cheerio.load(body);
    var links = [];
    $('.title a[href^="http"], a[href^="https"]').each(function() {
      links.push($(this));
    });
    res.render('api/scraping', {
      title: 'Web Scraping',
      links: links
    });
  });
};

/**
 * GET /api/github
 * GitHub API Example.
 */
exports.getGithub = function(req, res, next) {
  Github = require('github-api');

  var token = _.find(req.user.tokens, { kind: 'github' });
  var github = new Github({ token: token.accessToken });
  var repo = github.getRepo('sahat', 'requirejs-library');
  repo.show(function(err, repo) {
    if (err) {
      return next(err);
    }
    res.render('api/github', {
      title: 'GitHub API',
      repo: repo
    });
  });

};


/**
 * GET /api/nyt
 * New York Times API example.
 */
exports.getNewYorkTimes = function(req, res, next) {
  request = require('request');

  var query = querystring.stringify({
    'api-key': process.env.NYT_KEY,
    'list-name': 'young-adult'
  });
  var url = 'http://api.nytimes.com/svc/books/v2/lists?' + query;

  request.get(url, function(err, request, body) {
    if (err) {
      return next(err);
    }
    if (request.statusCode === 403) {
      return next(Error('Missing or Invalid New York Times API Key'));
    }
    var bestsellers = JSON.parse(body);
    res.render('api/nyt', {
      title: 'New York Times API',
      books: bestsellers.results
    });
  });
};

/**
 * GET /api/fitbit
 */
exports.getFitbitProfile = function(req, res, next) {
  fitbit = require("fitbit-node");
  var token = _.find(req.user.tokens, { kind: 'fitbit' });
  console.log("token", token);
  // var token = "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0NTUyOTYzNTIsInNjb3BlcyI6InJwcm8gcmhyIHJsb2MgcmFjdCIsInN1YiI6IjQ5Q05HWSIsImF1ZCI6IjIyN0dISCIsImlzcyI6IkZpdGJpdCIsInR5cCI6ImFjY2Vzc190b2tlbiIsImlhdCI6MTQ1NTI5Mjc1Mn0.FF-rQoVS7x_FdRXKrxx35A54N7E4K2OpzhhQdmhHW_0";
  var client = new fitbit(process.env.FITBIT_CLIENT_ID, process.env.FITBIT_SECRET);

  async.parallel({
    getProfile: function(done) {
      client.get("/profile.json", token.accessToken).then(function(err, results) {
        console.log(err);
        done(err, results)
      })
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/fitbit', {
      title: 'Fitbit API',
      data: results.getProfile
    });
  });
}

/**
 * GET /api/moves
 */
exports.getMovesProfile = function(req, res, next) {
  request = require('request');
  var token = _.find(req.user.tokens, { kind: 'moves' });

  var query = querystring.stringify({
    'access_token': token.accessToken,
  });
  var url = 'https://api.moves-app.com/api/1.1/user/profile?' + query;

  request.get(url, function(err, request, body) {
    if (err) {
      return next(err);
    }
    if (request.statusCode === 403) {
      return next(Error('Missing or Invalid Moves API Key'));
    }
    console.log(JSON.parse(body));
    res.render('api/moves', {
      data: JSON.parse(body)
    })
  })
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
        user: 'Zacoppotamus',
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
      user: 'Zacoppotamus',
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
 * POST /api/twitter
 * Post a tweet.
 */
exports.postTwitter = function(req, res, next) {
  req.assert('tweet', 'Tweet cannot be empty.').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twitter');
  }

  var token = _.find(req.user.tokens, { kind: 'twitter' });
  var T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.post('statuses/update', { status: req.body.tweet }, function(err, data, response) {
    if (err) {
      return next(err);
    }
    req.flash('success', { msg: 'Tweet has been posted.'});
    res.redirect('/api/twitter');
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
