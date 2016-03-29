'use strict';

angular.module('gestaltung', ['ngRoute', 'gestaltung.directives', 'gestaltung.services', 'gestaltung.controllers'])
  .config(function($routeProvider, $locationProvider) {
    // $routeProvider
    //   .when('/dashboard', {
    //     controller: 'DailyDashboardCtrl'
    //   })
    //   .when('/dashboard/#/weekly', {
    //     controller: 'WeeklyCtrl'
    //   })
      // .otherwise({
      //   redirectTo: '/'
      // });
    // $locationProvider.html5Mode(true);
  });
