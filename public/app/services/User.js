'use strict';

angular.module('gestaltung')
  .factory('User', function ($resource) {
    return $resource('/auth/signup');
  });
