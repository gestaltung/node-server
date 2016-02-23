'use strict';

/* Directives */

angular.module('gestaltung.directives', [])
	.directive('appVersion', function () {
  	return {
  		// restrict: 'AE',
  		// scope: {
  		// 	name: '=name'
  		// },
  		// template: 'Name: {{name}}',
  		link: function(scope, elm, attrs) {
  			// console.log(scope);
  			var artistContainer = d3.select(elm[0])
  				.append('div')
  				.attr('id', 'artistContainer');

  			var mapContainer = d3.select(elm[0])
  				.append('div')
  				.attr('id', 'mapContainer');

  			scope.$watch("name", function(newValue, oldValue) {
  				// console.log('new val', newValue);
		      artistContainer.append('p').text(scope.name);
		      // var container = d3.select(elm[0]).append('p').text(scope.name)
  			})

  			scope.$watch("trackPoints", function(newValue, oldValue) {
  				if (scope.trackPoints) {

	  				// Used to center the map
	  				var coordinates = {};
	  				coordinates.maxLat = _.maxBy(scope.trackPoints, 'lat').lat;
	  				coordinates.minLat = _.minBy(scope.trackPoints, 'lat').lat;
	  				coordinates.maxLon = _.maxBy(scope.trackPoints, 'lon').lon;
	  				coordinates.minLon = _.minBy(scope.trackPoints, 'lon').lon;
	  				
	  				console.log(coordinates);
	  				console.log(scope.places);
	  				var width = 500;
	  				var height = 500;

	  				var latScale = d3.scale.linear()
	  					.domain([coordinates.minLat, coordinates.maxLat])
	  					.range([20, height-20])

	  				var lonScale = d3.scale.linear()
	  					.domain([coordinates.maxLon, coordinates.minLon])
	  					.range([20, width-20])

						var lineFunction = d3.svg.line()
						 	.x(function(d) { return lonScale(d.lon); })
						 	.y(function(d) { return latScale(d.lat); })
							.interpolate("linear");

	  				var mapSvg = mapContainer.append('svg').attr('width', width).attr('height', height)
	  				
	  				var path = mapSvg
	  					.append("path")
	  					.attr("d", lineFunction(scope.trackPoints))
	  					.transition()
	  					.duration(2000)
	  					.attr("stroke", "black")
	  					.attr("stroke-width", 2)
	  					.attr("fill", "none");

	  				// Uncomment for path animation
	  				// var totalLength = path.node().getTotalLength();

				   //  path
				   //    .attr("stroke-dasharray", totalLength + " " + totalLength)
				   //    .attr("stroke-dashoffset", totalLength)
				   //    .transition()
				   //      .duration(2000)
				   //      .ease("linear")
				   //      .attr("stroke-dashoffset", 0);

	  				mapSvg
	  					.selectAll("circle")
	  						.data(scope.places)
	  					.enter()
	  					.append("circle")
	  					.attr("r", 4)
	  					.attr("fill", "red")
	  					.attr("cx", function(d) {
	  						console.log(d);
	  						return lonScale(d.location.lon);
	  					})
	  					.attr("cy", function(d) {
	  						return latScale(d.location.lat);
	  					})
  				}

  				// var container = d3.select(elm[0]).append('p').text('fdsafdsa')
  			})
  		}
  	}
    // return function(scope, elm, attrs) {
    // 	console.log(scope);
    // };
  });