'use strict';

/**
 * Session
 * returns info on authenticated user
 */
exports.session = function (req, res) {
  res.json(req.user.user_info);
};