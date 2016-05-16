'use strict';

/* Distance Summary directive */

// Used in the weekly and monthly views
angular.module('summary.directives', [])
  .directive('distanceSummary', function() {
    return {
      link: function(scope, elm, attr) {
        var summaryContainer = d3.select(elm[0])
          .append('div')
          .attr('id', 'summaryContainer');

        scope.$watch('summary', function(newValue, oldValue) {
          if (newValue == oldValue) {
            return;
          }
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
    selection.each(function(data, i) {

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

