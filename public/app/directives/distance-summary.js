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
  .directive('sleepSummary', function() {
    return {
      link: function(scope, elm, attr) {
        scope.$watch('summary', function(newValue, oldValue) {
          if (newValue == oldValue) {
            return;
          }

          d3.select('#sleepContainer').selectAll("*").remove();

          var sleepContainer = d3.select(elm[0])
            .append('div')
            .attr('id', 'sleepContainer')

          var sleepData = getSleepData();
          console.log('sleep data', sleepData);
          var sc = sleep().width(200).height(300);
          d3.select('#sleepContainer')
            .datum(sleepData)
            .call(sc);

          function getSleepData() {
            var data = [];
            for (var i=0; i<100; i++) {
              if (Math.random() < 0.08) {
                data.push({
                  'time': i,
                  'restless': 1
                });
              }
              else {
                data.push({
                  'time': i,
                  'restless': 0
                });
              }
            }

            return data;
          }

        })
      }
    }
  })

function sleep() {
  var width = 200;
  var height = 300;

  var y = d3.scale.linear().domain([0,100]).range([0, height]);
  var x = d3.scale.quantize().domain([0,1]).range([0, width/2]);


  function render(selection) {
    console.log('inside render', this);
    selection.each(function(d, i) {
      var line = d3.svg.line()
       .interpolate("step-after")
       .y(function(d) { return y(d.time)*2; })
       .x(function(d) { return x(d.restless); });

      d3.select(this).append('h1')
        .text('Sleep Quality')

      var svg = d3.select(this).append('svg')
        .attr('height', height)
        .attr('width', width)
        .append('g')

      svg.append('path')
        .attr('stroke', '#fff')
        .attr('stroke-width', '0.5')
        .attr('opacity', 0.8)
        .datum(d)
        .attr('class', 'sparkline')
        .attr('d', line);

      d3.select(this).append('h2')
        .text('Efficiency')

      var restlessCount = 0;
      _.each(d, function(d) {
        if(d.restless == 1) {
          restlessCount += 1;
        }
      });

      d3.select(this).append('p')
        .text('' + ((1 - restlessCount/100)*100) + '%');
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

