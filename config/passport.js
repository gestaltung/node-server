var _ = require('lodash');
var passport = require('passport');
var request = require('request');
var InstagramStrategy = require('passport-instagram').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var MovesStrategy = require('passport-moves').Strategy;
var OpenIDStrategy = require('passport-openid').Strategy;
var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

var User = require('../models/User');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  email = email.toLowerCase();
  User.findOne({ email: email }, function(err, user) {
    if (!user) {
      return done(null, false, { message: 'Email ' + email + ' not found'});
    }
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
}));

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
  passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.save(function(err) {
            req.flash('info', { msg: 'Facebook account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.' });
          done(err);
        } else {
          var user = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));


// Sign in with Twitter.

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: '/auth/twitter/callback',
  passReqToCallback: true
}, function(req, accessToken, tokenSecret, profile, done) {
  if (req.user) {
    User.findOne({ twitter: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.twitter = profile.id;
          user.tokens.push({ kind: 'twitter', accessToken: accessToken, tokenSecret: tokenSecret });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.picture = user.profile.picture || profile._json.profile_image_url_https;
          user.save(function(err) {
            req.flash('info', { msg: 'Twitter account has been linked.' });
            done(err, user);
          });
        });
      }
    });

  } else {
    User.findOne({ twitter: profile.id }, function(err, existingUser) {
      if (existingUser) {
        return done(null, existingUser);
      }
      var user = new User();
      // Twitter will not provide an email address.  Period.
      // But a person’s twitter username is guaranteed to be unique
      // so we can "fake" a twitter email address as follows:
      user.email = profile.username + "@twitter.com";
      user.twitter = profile.id;
      user.tokens.push({ kind: 'twitter', accessToken: accessToken, tokenSecret: tokenSecret });
      user.profile.name = profile.displayName;
      user.profile.location = profile._json.location;
      user.profile.picture = profile._json.profile_image_url_https;
      user.save(function(err) {
        done(err, user);
      });
    });
  }
}));

/**
 * Tumblr API OAuth.
 */
// passport.use('tumblr', new OAuthStrategy({
//     requestTokenURL: 'http://www.tumblr.com/oauth/request_token',
//     accessTokenURL: 'http://www.tumblr.com/oauth/access_token',
//     userAuthorizationURL: 'http://www.tumblr.com/oauth/authorize',
//     consumerKey: process.env.TUMBLR_KEY,
//     consumerSecret: process.env.TUMBLR_SECRET,
//     callbackURL: '/auth/tumblr/callback',
//     passReqToCallback: true
//   },
//   function(req, token, tokenSecret, profile, done) {
//     User.findById(req.user._id, function(err, user) {
//       user.tokens.push({ kind: 'tumblr', accessToken: token, tokenSecret: tokenSecret });
//       user.save(function(err) {
//         done(err, user);
//       });
//     });
//   }
// ));

/**
 * Moves API OAuth
 */
passport.use(new MovesStrategy({
    clientID: process.env.MOVES_ID,
    clientSecret: process.env.MOVES_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/moves/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ movesId: profile.id }, function(err, existingUser) {
      if (existingUser) {
        return done(null, existingUser);
      }
      var user = new User();
      console.log(profile);
      user.moves = profile.id;
      user.save(function(err) {
        done(err, user);
      });
    });
  }
));


/**
 * Foursquare API OAuth.
 */
// passport.use('foursquare', new OAuth2Strategy({
//     authorizationURL: 'https://foursquare.com/oauth2/authorize',
//     tokenURL: 'https://foursquare.com/oauth2/access_token',
//     clientID: process.env.FOURSQUARE_ID,
//     clientSecret: process.env.FOURSQUARE_SECRET,
//     callbackURL: process.env.FOURSQUARE_REDIRECT_URL,
//     passReqToCallback: true
//   },
//   function(req, accessToken, refreshToken, profile, done) {
//     User.findById(req.user._id, function(err, user) {
//       user.tokens.push({ kind: 'foursquare', accessToken: accessToken });
//       user.save(function(err) {
//         done(err, user);
//       });
//     });
//   }
// ));


/**
 * Login Required middleware.
 */
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect('/auth/' + provider);
  }
};
