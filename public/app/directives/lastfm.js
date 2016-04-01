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

          var cloud = new ArtistCloud();
          cloud.init(scope.data.lastfm);
          cloud.draw();

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

/**
 * Artist Cloud Object
 */
var ArtistCloud = function() {
  return {
    data: '',
    layout: '',
    size: '',
    init: function(data) {
      this.data = data;
      this.size = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
          return +d.playcount;
        }))
        .range([10, 60]);
      console.log(this.data, this.size);
    },
    draw: function() {
      console.log(this.data, this.size);
      var that = this;
      var layout = d3.layout.cloud()
        .size([500, 500])
        .words(this.data.map(function(d) {
          return {text: d.artist, size: that.size(d.playcount), test: "haha"};
        }))
        .padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Avant Garde")
        .fontSize(function(d) { return d.size; })
        .on("end", render);

      layout.start();

      function render(words) {
        d3.select("#lastfmContainer").append("svg")
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
    }
  }
}





