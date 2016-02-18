'use strict';

angular.module('gestaltung', ['ngRoute', 'gestaltung.directives', 'gestaltung.services', 'gestaltung.controllers'])
  .config(function($routeProvider, $locationProvider) {
    // $routeProvider
    //   .when('/', {
    //     controller: 'DashboardCtrl'
    //   })
      // .otherwise({
      //   redirectTo: '/'
      // });
    // $locationProvider.html5Mode(true);
  });