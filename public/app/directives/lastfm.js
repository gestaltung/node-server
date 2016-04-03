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

          var artistCloud = cloud().width(500).height(500);
          d3.select('#lastfmContainer')
            .datum(scope.data.lastfm)
            .call(artistCloud);

        })
      }
    }
  })

function cloud() {
  var width = 500,
    height = 500;

  function render(selection) {
    selection.each(function(data, i) {
      var that = this;
      var scale = {};
      scale.size = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
          return +d.playcount;
        }))
        .range([10, 60]);

      var layout = d3.layout.cloud()
        .size([width, height])
        .words(data.map(function(d) {
          return {text: d.artist, size: scale.size(d.playcount), test: "haha"};
        }))
        .padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Avant Garde")
        .fontSize(function(d) { return d.size; })
        .on("end", drawLayout);

      layout.start();

      function drawLayout(words) {
        console.log(that);
        d3.select(that).append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
          .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Avant Garde")
            .style("fill", "white")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
      }

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

