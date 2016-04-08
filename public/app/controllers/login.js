'use strict';

angular.module('gestaltung')
  .controller('LoginCtrl', function ($scope, Auth, $location) {
    $scope.error = {};
    $scope.user = {};

    alert('ctrl initialized');

    $scope.login = function(form) {
      Auth.login('password', {
          'email': $scope.user.email,
          'password': $scope.user.password
        },
        function(err) {
          $scope.errors = {};

          if (!err) {
            $location.path('/');
          } else {
            angular.forEach(err.errors, function(error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.type;
            });
            $scope.error.other = err.message;
          }
      });
    };
  });
