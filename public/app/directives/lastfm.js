'use strict';

/* Last.fm directive */

// Used in the weekly and monthly views
angular.module('lastfm.directives', [])
  .directive('lastfmCloud', function() {
    return {
      link: function(scope, elm, attr) {
        var lastfmContainer = d3.select(elm[0])
          .append('div')
          .attr('id', 'lastfmContainer');

        scope.$watch('data.lastfm', function(newValue, oldValue) {
          if (newValue == oldValue) {
            return;
          }

          console.log('scope.data.lastfm', scope.data.lastfm);

          d3.select('#lastfmContainer').selectAll("*").remove();
          lastfmContainer.selectAll('p')
            .data(scope.data.lastfm)
            .enter()
            .append('p')
            .text(function(d) {
              return d.artist + ' ' + d.playcount + 'x';
            })
        })
      }
    }
  })
