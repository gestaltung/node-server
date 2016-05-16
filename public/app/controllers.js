'use strict';

/* Controller */
angular.module('gestaltung.controllers', [])
	.controller('DailyDashboardCtrl', function($scope, $http, $q, $timeout, $interval) {
		console.log('DailyDashboardCtrl instantiated');
		// 1 sec is 5 minutes
		var timeFactor = 5;
		$scope.name = null;
		$scope.trackPoints = null;
		$scope.date = moment("12032016", "DDMMYYYY").add(-1, 'day');
		$scope.data = null;
    $scope.summary = null;

		// Specify whether we're animating a date range
		$scope.range = false;
		$scope.startDate = null;
		$scope.endDate = null;
		$scope.currentDate = moment('20160213', 'YYYYMMDD');

		var endDate = moment(moment().format('YYYYMMDD'));

		// if ($scope.range) {
		// 	var timeIdx = 0;
		// 	while(!$scope.currentDate.isSame(endDate)) {
		// 		(function(_date) {
		// 			$timeout(function() {
		// 				// $scope.apply not needed since we're using $timeout
		// 				console.log('$scope.date', _date)
		// 				getDailySummary(_date);
		// 			}, timeIdx*1000);
		// 		})($scope.currentDate.format("YYYYMMDD"))

		// 		$scope.currentDate = $scope.currentDate.add(1, 'day');
		// 		timeIdx++;
		// 	}
		// }
		// else {
    // }

    getQueuedSummary($scope.date.format('YYYYMMDD'));

		$scope.$watch($scope.date, function(newVal, oldVal) {
			if (newVal === oldVal) {
				return;
			}
			alert('$scope.date changed');
      getQueuedSummary($scope.date.format('YYYYMMDD'));
		})

		$scope.addDate = function() {
			$scope.date = $scope.date.add(1, "day");
      getQueuedSummary($scope.date.format('YYYYMMDD'));
		}

		$scope.removeDate = function() {
			$scope.date = ($scope.date).add(-1, "day");
      getQueuedSummary($scope.date.format('YYYYMMDD'));
		}

		// $scope.printSummary = function() {
		// 	var places = _.filter($scope.data.movesStoryline, function(d) {
		// 		if (d.type === 'place') {
		// 			return d.place !== 'unknown'
		// 		}
		// 		return false;
		// 	})

		// 	places = _.uniqBy(places, 'place');

		// 	$http({
		// 		method: 'POST',
		// 		url: '/api/thermal',
		// 		headers : { 'Content-Type': 'application/json' },
		// 		data: {
		// 			'date': $scope.date.format('DD/MM/YYYY'),
		// 			'places': places
		// 		}
		// 	})
		// }

    function getTransportSummary(date) {
      $http({
        method: 'GET',
        url: '/api/moves/distance',
        params: {
          'date': date
        }
      })
      .success(function (data, status, headers, config) {
        $scope.summary = data;
        console.log(data);
      })
    }

    function getQueuedSummary(date) {
      $q.all([
        $http.get('/api/summary/daily?date=' + date),
        $http.get('/api/moves/distance?date=' + date)
      ])
      .then(function(responses) {
        console.log(responses[0],responses[1]);
        $scope.data = responses[0].data;
        $scope.summary = responses[1].data;
        extractPlaces(responses[0].data);
      });
    }

    function extractPlaces(data) {
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
    }

		// function getDailySummary(date) {
		// 	console.log('date', date);
		// 	$http({
		// 		method: 'GET',
		// 		url: '/api/summary/daily',
		// 		params: {
		// 			'date': date
		// 		}
		// 	})
		// 	.success(function (data, status, headers, config) {
		// 		try {
		// 			$scope.name = data.lastfmScrobbles[0].artist;
		// 		}
		// 		catch(e) {
		// 			$scope.name = null;
		// 		}

		// 		var trackPoints = [];
		// 		var places = [];
		// 		for (var m in data.movesStoryline) {
		// 			var move = data.movesStoryline[m];
		// 			if (move.type === "move") {
		// 				trackPoints.push(move.trackPoints);
		// 			}
		// 			else if (move.type === "place") {
		// 				places.push(move);
		// 			}
		// 		}

		// 		$scope.trackPoints = _.flatten(trackPoints);
		// 		$scope.places = places;
		// 		// $scope.date = date.format("DD/MM/YYYY");
		// 		$scope.data = data;
		// 	})
		// 	.error(function (data, status, headers, config) {
		// 		$scope.name = 'Error!';
		// 	});
		// }

	})
  .controller('CustomDashboardCtrl', function($scope, $http, $q, $timeout, $interval, Data) {
    console.log('custom range dashboard controller instantiated');
    $scope.dates = {};
    $scope.dates.from = moment().add(-1, 'weeks').format('YYYYMMDD');
    $scope.dates.to = moment().format('YYYYMMDD');
    $scope.dates.from = "20160301";
    $scope.dates.to = "20160331";
    $scope.data;

    // Make sure requests are made in parallel
    $q.all([
      $http.get('/api/lastfm/artists?from=' + $scope.dates.from + '&to=' + $scope.dates.to),
      $http.get('/api/moves/summary?from=' + $scope.dates.from + '&to=' + $scope.dates.to)
    ])
    .then(function(responses) {
      $scope.data = {};
      $scope.data.moves = {}
      $scope.data.lastfm = Data.lastfm(responses[0].data);
      $scope.data.moves.overview = Data.moves(responses[1].data);
      $scope.data.moves.steps = Data.moves_steps(responses[1].data);
      console.log($scope.data);
    });
  })


