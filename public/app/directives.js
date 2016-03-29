'use strict';

/* Directives */

angular.module('gestaltung.directives', [])
	.directive('userDashboard', function () {
		return {
			// restrict: 'AE',
			// scope: {
			// 	name: '=name'
			// },
			// template: 'Name: {{name}}',
			link: function(scope, elm, attrs) {
				var mapContainer = d3.select(elm[0])
					.append('div')
					.attr('id', 'mapContainer');

				// Will be inside the reflection
				var timelineContainer = d3.select(elm[0])
					.append('div')
					.attr('id', 'timelineContainer');

				var mapSvg = mapContainer.append('svg').attr('width', 500).attr('height', 500);
				var coordinates = {};

				scope.$watch("name", function(newValue, oldValue) {
					// console.log('new val', newValue);
					// artistContainer.append('p').text(scope.name);
					// var container = d3.select(elm[0]).append('p').text(scope.name)
				})

				scope.$watch("data", function(newVal, oldValue) {
					if (scope.data) {
						// Big transition here going through the whole day
					}
				});

				scope.$watch("trackPoints", function(newValue, oldValue) {
					if (scope.trackPoints) {
						try {
							// Used to center the map
							coordinates.maxLat = _.maxBy(scope.trackPoints, 'lat').lat;
							coordinates.minLat = _.minBy(scope.trackPoints, 'lat').lat;
							coordinates.maxLon = _.maxBy(scope.trackPoints, 'lon').lon;
							coordinates.minLon = _.minBy(scope.trackPoints, 'lon').lon;
							mapSvg.remove('path');
							mapSvg.remove('text');
							drawMap();
						}
						catch(e) {
							// No data
							mapSvg.remove('path');
							mapSvg.selectAll('text')
								.data('No Data')
								.enter()
								.append('text');
						}
					}
				});

				var drawMap = function() {
					var width = 500;
					var height = 500;

					var latScale = d3.scale.linear()
						.domain([coordinates.maxLat, coordinates.minLat])
						.range([20, height-20])

					var lonScale = d3.scale.linear()
						.domain([coordinates.maxLon, coordinates.minLon])
						.range([20, width-20])

					var lineFunction = d3.svg.line()
						.x(function(d) { return lonScale(d.lon); })
						.y(function(d) { return latScale(d.lat); })
						.interpolate("linear");

					mapSvg = mapContainer.append('svg').attr('width', width).attr('height', height);

					var path = mapSvg
						.append("path")
						.attr("d", lineFunction(scope.trackPoints))
						.transition()
						.duration(500)
						.attr("stroke", "white")
						.attr("stroke-width", 2)
						.attr("fill", "none");

					mapSvg.append("text")
						.text(scope.date);

					mapSvg
						.selectAll("circle")
							.data(scope.places)
						.enter()
						.append("circle")
						.transition()
						.duration(2000)
						.attr("r", 4)
						.attr("fill", "red")
						.attr("cx", function(d) {
							return lonScale(d.location.lon);
						})
						.attr("cy", function(d) {
							return latScale(d.location.lat);
						})
				}
			}
		}
	})
  .directive('placesSummary', function() {
    return {
      link: function(scope, elm, attr) {
        var placesContainer = d3.select(elm[0])
          .append('div')
          .attr('id', 'placesContainer');

        scope.$watch('data', function(newValue, oldValue) {
          if (newValue == oldValue) {
            return;
          }
          var places = _.filter(scope.data.movesStoryline, function(d) {
            if (d.type === 'place') {
              return d.place !== 'unknown'
            }
            return false;
          })
          console.log('scope.places', scope.places);

          places = _.uniqBy(places, 'place');
          console.log('places', places);

          d3.select('#placesContainer').selectAll("*").remove();
          placesContainer.selectAll('p')
            .data(places)
            .enter()
            .append('p')
            .text(function(d) {
              return d.place;
            })
        })
      }
    }
  })
	// .directive('artistCloud', function() {
	// 	return {
	// 		link: function(scope, elm, attrs) {
	// 			var artistContainer = d3.select(elm[0])
	// 				.append('div')
	// 				.attr('id', 'artistContainer');

	// 			scope.$watch("data", function(newValue, oldValue) {
	// 				if (newValue == oldValue) {
	// 					// Initializing
	// 					return;
	// 				}


	// 				var artists = _.uniqBy(scope.data.lastfmScrobbles, 'artist');

	// 				d3.select('#artistContainer').selectAll("*").remove();
	// 				artistContainer.selectAll('p')
	// 					.data(artists, function(d) {
	// 						return d.artist;
	// 					})
	// 					.enter()
	// 					.append('p')
	// 					.text(function(d) {
	// 						return d.artist;
	// 					})

	// 			})
	// 		}
	// 	}
	// })


