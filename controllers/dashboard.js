/**
 * GET /dashboard
 * Main dashboard page.
 */
exports.getDailyDashboard = function(req, res) {
  res.status(200).render('dashboard', {
    title: 'Daily Dashboard View'
  });
};

exports.getCustomDashboard = function(req, res) {
  res.status(200).render('dashboard-custom', {
    title: 'Custom Range Dashboard View'
  });
};
