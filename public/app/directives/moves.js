'use strict';

/* Moves directive */

// Used in the weekly and monthly views (aggregated data)
angular.module('moves.directives', [])
  .directive('movesAggInfo', function() {
    return {
      link: function(scope, elm, attr) {
        var movesContainer = d3.select(elm[0])
          .append('div')
          .attr('id', 'movesContainer');

        scope.$watch('data.moves', function(newValue, oldValue) {
          console.log(newValue, oldValue);
          if (newValue == oldValue) {
            if (!scope.data) {
              return;
            }
          }

          // if (scope.data.moves.aggregate) blablabla

          // d3.select('#movesContainer').selectAll("*").remove();
          // movesContainer.selectAll('p')
          //   .data(scope.data.moves)
          //   .enter()
          //   .append('p')
          //   .text(function(d) {
          //     return '' + d.distance/1000 + ' km';
          //   })
          // _.each(scope.data.moves, function(activity) {
          //   // movesContainer.append('h1')
          //   //   .text(activity.group)

          // })


        })

        scope.$watch('data.moves_2', function(newValue, oldValue) {
          if (newValue == oldValue) {
            return;
          }

          console.log('steps()', steps);

          var stepChart = steps().width(700);

          d3.select('#movesContainer')
            .datum(scope.data.moves_2)
            .call(stepChart);
        })
      }
    }
  })

function steps() {
  var width = 700,
    height = 250;

  function render(selection) {
    console.log('inside render', this);
    selection.each(function(d, i) {
      // d: data, i: iteration, this: element
      var scale = {};
      scale.y = d3.scale.linear()
        .domain(d3.extent(d))
        .range([height, 0]);
      var barSpacing = width/d.length;

      d3.select(this).append('svg')
        .attr('height', height)
        .attr('width', width)
        .selectAll('rect')
        .data(d)
        .enter()
        .append('rect')
        .attr('y', function(d,i) {
          return scale.y(d);
        })
        .attr('height', function(d,i) {
          console.log(scale.y, scale.y(d))
          return height - scale.y(d);
        })
        .attr('x', function(d,i) {
          return i * barSpacing;
        })
        .attr('width', function(d,i) {
          return barSpacing - 5;
        })
        .style('fill', 'white');

    })
  }

  render.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return render;
  };

  render.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return render;
  };

  return render;
}
