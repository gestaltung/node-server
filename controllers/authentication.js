/**
 * This controller will ultimately implement an oAuth2 framework allowing external
 * apps/devices to interface with the framework. For the time being though it is
 * super simple and relies on the user providing the user id, after which access
 * tokens for different linked services are provided.
 */

var _ = require('lodash');
var User = require('../models/User');

exports.getTokens = function(req, res) {
	if (req.query.user_id) {
		User.findById(req.query.user_id, function(err, user) {
			if (err) {
				res.status(500).send(err);
				return;
			}
			else if (!user) {
				res.status(500).send('no user by this ID');
				return;
			}

			var response = {};
			var tokens = [];
			_.each(user.tokens, function(d) {
				tokens.push(d)
			})
			response.tokens = tokens;
			res.send(user);
		})
	}
	else {
		res.status(500).send('No user ID provided');
		return;
	}
}