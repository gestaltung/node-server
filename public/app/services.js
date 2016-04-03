'use strict';

/* Services */


// Preprocessing factory for different returned API data
angular.module('gestaltung.services', [])
  .factory('Data', function() {
    return {
      lastfm: function(data) {
        return data;
      },
      moves: function(data) {
        console.log(data);
        var all = [];
        var output = [];
        _.each(data, function(d) {
          if (d.summary) {
            all.push(d.summary);
          }
        });
        all = _.flatten(all);
        // Unique Activity groups
        var a_groups = _.map(all, function(d) {
          return d.activity;
        });
        a_groups = _.uniq(a_groups)
        _.each(a_groups, function(grp) {
          var agg = {};
          agg.group = grp;

          // Relevant segments
          var s = _.filter(all, function(d) {
            return d.activity === grp;
          });
          agg.distance = _.sumBy(s, function(d) {
            return d.distance;
          });
          output.push(agg);
        })
        console.log(output);
        return output;
      },
      moves_steps: function(data) {
        var output = [];
        _.map(data, function(d) {
          var w = _.find(d.summary, function(o) {
            return o.activity === "walking";
          });

          if (w) {
            output.push(w.steps)
          }
          else {
            output.push(0);
          }
        })
        console.log('output length', output.length);
        return output;
      }
    }
  })
