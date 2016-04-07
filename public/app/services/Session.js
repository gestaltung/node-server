'use strict';

angular.module('gestaltung')
  .factory('Session', function ($resource) {
    return $resource('/auth/session/');
  });
