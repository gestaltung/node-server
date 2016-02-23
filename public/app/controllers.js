'use strict';

/* Controller */
angular.module('gestaltung.controllers', [])
	.controller('DashboardCtrl', function($scope, $http, $timeout, $interval) {
		console.log('DashboardCtrl instantiated');
		// 1 sec is 5 minutes
		var timeFactor = 5; 
		$scope.name = 'Zac';
		$scope.trackPoints = null;

		// Make API request for one day's data every minute and store it
		$interval(function() {
			// var day = 
			// Make API call
			// Save data
			// Reverse Last.fm scrobble array
			// Divide day into 5-minute sections
				// $timeout and update directive
				// send location on map
				// send playing song
				// send steps
		}, 60000)

		$http({
					method: 'GET',
					url: '/api/getDailySummary'
				}).
				success(function (data, status, headers, config) {
					// $scope.name = data.lastfmScrobbles[0].artist;
					$scope.name = null;
					console.log(data);
					console.log(_.sum);
					var trackPoints = [];
					var places = [];
					for (var m in data.movesStoryline) {
						var move = data.movesStoryline[m];
						if (move.type === "move") {
							trackPoints.push(move.trackPoints);
						}
						else if (move.type === "place") {
							places.push(move);
						}
					}
					console.log('trackPoints', _.flatten(trackPoints));
					$scope.trackPoints = _.flatten(trackPoints);
					$scope.places = places;
				}).
				error(function (data, status, headers, config) {
					$scope.name = 'Error!';
				});

		for (var idx = 0; idx<5; idx++) {
			var a = idx+1;
			(function(_idx) {
				$timeout(function() {
					// $scope.apply not needed since we're using $timeout
					$scope.name = _idx;
				}, idx*5000);
			})(a)
		}
	})