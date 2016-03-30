/**
 * GET /dashboard
 * Main dashboard page.
 */
exports.getDailyDashboard = function(req, res) {
  res.render('dashboard', {
    title: 'Daily Dashboard View'
  });
};

exports.getCustomDashboard = function(req, res) {
  res.render('dashboard-custom', {
    title: 'Custom Range Dashboard View'
  });
};

// To do: Maybe make a POST route for some 3D stuff rendered in the back-end
