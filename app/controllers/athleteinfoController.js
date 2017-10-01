(function() {
    var app = angular.module('strvr');
    var app2 = angular.module('myApp', ['ngMap']);

    app.controller('AthleteInfoController', AthleteInfoController);
    app2.controller('mapController', mapController);



    function AthleteInfoController($scope, AthleteFactory) {

        var that = this;

        that.athleteInfo;
        that.segments = [];
        that.leaderboard = [];

        function init() {
            that.PopulateSegments();
        }

        that.PopulateSegments = function(response) {
            AthleteFactory.getSegmentsExplore()
                .then(UpdateSegments)
                .then(that.PopulateLeaderboard)
        };

        function UpdateSegments(response) {
            var count = 0;
            that.segments = [];
            console.log(JSON.stringify(response.data.segments));
            while (count < response.data.segments.length) {
                that.segments.push(response.data.segments[count]);
                count++;
            }
        }

        that.PopulateAthleteInfo = function(response) {
            AthleteFactory.getInfo()
                .then(updateAthleteInfo)
        };

        that.PopulateLeaderboard = function() {
            var count = 0;
            console.log("lengte: " + that.segments.length);
            while (count < that.segments.length) {
                AthleteFactory.getLeaderboard(that.segments[count])
                    .then(function updateLeaderboard(response, headers) {
                        var newJson = $.extend({}, {idd : response.config.idd }, {segmentname : response.config.segmentname },  response.data);
                        that.leaderboard.push( newJson);
                        console.log(response.data.entries[0].athlete_name);
                        console.log("new " + newJson.entry_count);
                    })
                count++;
            }
        };


        function updateAthleteInfo(response) {
            that.athleteInfo = response.data;
        }


        init();
    }
})();