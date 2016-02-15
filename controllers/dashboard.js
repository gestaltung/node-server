/**
 * GET /dashboard
 * Main dashboard page.
 */
exports.getDashboard = function(req, res) {
  res.render('dashboard', {
    title: 'Dashboard'
  });
};


// To do: Maybe make a POST route for some 3D stuff rendered in the back-end