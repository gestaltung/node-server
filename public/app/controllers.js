'use strict';

/* Controller */
angular.module('gestaltung.controllers', [])
	.controller('DashboardCtrl', function($scope, $http, $timeout, $interval) {
		console.log('DashboardCtrl instantiated');
		// 1 sec is 5 minutes
		var timeFactor = 5; 
		$scope.name = null;
		$scope.trackPoints = null;
		$scope.date = moment('20160222', 'YYYYMMDD');
		$scope.data = null;

		// Specify whether we're animating a date range
		$scope.range = false;
		$scope.startDate = null;
		$scope.endDate = null;
		$scope.currentDate = moment('20160213', 'YYYYMMDD');

		var endDate = moment(moment().format('YYYYMMDD'));


		if ($scope.range) {
			var timeIdx = 0;
			while(!$scope.currentDate.isSame(endDate)) {
				(function(_date) {
					$timeout(function() {
						// $scope.apply not needed since we're using $timeout
						console.log('$scope.date', _date)
						getDailySummary(_date);
					}, timeIdx*1000);
				})($scope.currentDate.format("YYYYMMDD"))

				$scope.currentDate = $scope.currentDate.add(1, 'day');
				timeIdx++;
			}
		}
		else {
			getDailySummary($scope.currentDate);
		}

		$scope.$watch($scope.date, function(newVal, oldVal) {
			if (newVal === oldVal) {
				return;
			}
			alert('$scope.date changed');
			getDailySummary($scope.date);
		})

		$scope.addDate = function() {
			$scope.date = $scope.date.add(1, "day");
			getDailySummary($scope.date.format('YYYYMMDD'));
		}

		$scope.removeDate = function() {
			$scope.date = ($scope.date).add(-1, "day");
			getDailySummary($scope.date.format('YYYYMMDD'));
		}

		function getDailySummary(date) {
			$http({
						method: 'GET',
						url: '/api/getDailySummary',
						params: {
							'date': date
						}
					})
					.success(function (data, status, headers, config) {
						try {
							$scope.name = data.lastfmScrobbles[0].artist;
						}
						catch(e) {
							$scope.name = null;
						}

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

						$scope.trackPoints = _.flatten(trackPoints);
						$scope.places = places;
						// $scope.date = date.format("DD/MM/YYYY");
						$scope.data = data;
					})
					.error(function (data, status, headers, config) {
						$scope.name = 'Error!';
					});

			// for (var idx = 0; idx<5; idx++) {
			// 	var a = idx+1;
			// 	(function(_idx) {
			// 		$timeout(function() {
			// 			// $scope.apply not needed since we're using $timeout
			// 			$scope.name = _idx;
			// 		}, idx*5000);
			// 	})(a)
			// }
		}
	})
