'use strict';

angular.module('gestaltung', ['ngRoute', 'gestaltung.directives', 'lastfm.directives', 'moves.directives', 'gestaltung.services', 'gestaltung.controllers'])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl'
      })
      .when('/account', {
        templateUrl: 'partials/account.html',
        controller: 'AccountCtrl'
      })
      .when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/account/settings', {
        templateUrl: 'partials/settings.html',
        controller: 'AccountCtrl'
      })
      .when('/account/link', {
        templateUrl: 'partials/link.html',
        controller: 'AccountCtrl'
      })
      .when('/account/link/phone', {
        templateUrl: 'partials/link/phone.html',
        controller: 'AccountCtrl'
      })
      .when('/account/link/lastfm', {
        templateUrl: 'partials/link/lastfm.html',
        controller: 'AccountCtrl'
      })
      .when('/dashboard', {
        templateUrl: 'partials/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/dashboard/custom', {
        templateUrl: 'partials/dashboard_custom.html',
        controller: 'DashboardCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  })

  .run(function ($rootScope, $location, Auth) {

    //watching the value of the currentUser variable.
    $rootScope.$watch('currentUser', function(currentUser) {
      // if no currentUser and on a page that requires authorization then try to update it
      // will trigger 401s if user does not have a valid session
      if (!currentUser && (['/', '/login', '/logout', '/signup'].indexOf($location.path()) == -1 )) {
        Auth.currentUser();
      }
    });

    // On catching 401 errors, redirect to the login page.
    $rootScope.$on('event:auth-loginRequired', function() {
      $location.path('/login');
      return false;
    });
  });
