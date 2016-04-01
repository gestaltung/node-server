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

          d3.select('#movesContainer').selectAll("*").remove();
          movesContainer.selectAll('p')
            .data(scope.data.moves)
            .enter()
            .append('p')
            .text(function(d) {
              return '' + d.distance/1000 + ' km';
            })
          _.each(scope.data.moves, function(activity) {
            // movesContainer.append('h1')
            //   .text(activity.group)

          })
        })
      }
    }
  })
