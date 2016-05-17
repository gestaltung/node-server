'use strict';

/* Distance Summary directive */

// Used in the weekly and monthly views
angular.module('summary.directives', [])
  .directive('distanceSummary', function() {
    return {
      link: function(scope, elm, attr) {

        scope.$watch('summary', function(newValue, oldValue) {
          if (newValue == oldValue) {
            return;
          }
          d3.select('#summaryContainer').selectAll("*").remove();

          var summaryContainer = d3.select(elm[0])
            .append('div')
            .attr('id', 'summaryContainer');

          console.log(scope.summary);
          var sm = summary().width(300).height(500);
          d3.select('#summaryContainer')
            .datum(scope.summary)
            .call(sm);

        })
      }
    }
  })

function summary() {
  var width = 300,
    height = 500;

  function render(selection) {
    console.log('inside render');
    selection.each(function(data, i) {
      d3.select(this)
        .append('p')
        .text('Total Distance')
        .datum(data.distance)
        .append('p')
        .text(function(d) {
          return d + ' km';
        })

      d3.select(this)
        .append('p')
        .text('Total Steps')
        .datum(data.totalSteps)
        .append('p')
        .text(function(d) {
          return d;
        })

      d3.select(this)
        .append('p')
        .text('Transport')
        .datum(data.transport.distance)
        .append('p')
        .text(function(d) {
          return d + ' km';
        })
        .datum(data.transport.duration)
        .append('p')
        .text(function(d) {
          return d + ' mins';
        })

      d3.select(this)
        .append('p')
        .text('Walking')
        .datum(data.walking.distance)
        .append('p')
        .text(function(d) {
          return d + ' km';
        })
        .datum(data.walking.duration)
        .append('p')
        .text(function(d) {
          return d + ' mins';
        })

      // d3.select(this)
      //   .append('p')
      //   .text('Transport')
      //   .datum(data.transport.distance)
      //   .append('p')
      //   .text(function(d) {
      //     return d + ' km';
      //   })

      // d3.select(this).selectAll('p')
      //   .data([1,2,3,4])
      //   .enter()
      //   .append('p')
      //   .text(function(d) {
      //     return d;
      //   })
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

