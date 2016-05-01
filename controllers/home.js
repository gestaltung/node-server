/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  res.status(200).render('home', {
    title: 'Home'
  });
};
