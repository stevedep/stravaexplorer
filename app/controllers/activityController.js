(function() {
    var app = angular.module('strvr');

    app.controller('ActivityController', ['$scope', '$routeParams', 'AthleteFactory', ActivityController]);

    function ActivityController($scope, $routeParams, AthleteFactory) {

        var that = this;

        that.segments = [];
        that.ride;
        that.activityId;

        that.distanceFilters = [{
            value: 0,
            label: '-'
        }, {
            value: 500,
            label: '0.5km'
        }, {
            value: 1000,
            label: '1km'
        }, {
            value: 3000,
            label: '3km'
        }, {
            value: 5000,
            label: '5km'
        }];

        that.distanceFilter = that.distanceFilters[0];

        that.gradientFilters = [{
            value: -100,
            label: '-'
        }, {
            value: 1,
            label: '1%'
        }, {
            value: 2,
            label: '2%'
        }, {
            value: 3,
            label: '3%'
        }, {
            value: 5,
            label: '5%'
        }]

        that.gradientFilter = that.gradientFilters[3];


        function init() {
            that.activityId = $routeParams.activityId;
            that.populateSegments();
        }

        that.populateSegments = function(response) {
            AthleteFactory.getSegments(that.activityId)
                .then(updateSegments)
                .then(createChart);
        }

        function createChart(response) {
            var chartData = [];
            console.log(that.ride);
            for (var i = 0; i < that.ride.segment_efforts.length; i++) {

                var showValue = "0";
                if (that.ride.segment_efforts[i].segment.elevation_high > 70) {
                    showValue = "1";
                }
                chartData.push({
                    'value': that.ride.segment_efforts[i].segment.elevation_high,
                    'showValue': showValue,
                    'drawAnchors': 0
                });
            }

            var revenueChart = new FusionCharts({
                "type": "splinearea",
                "renderAt": "chartContainer",
                "width": "100%",
                "height": "300",
                "dataFormat": "json",
                "drawAnchors": "0",
                "dataSource": {
                    "chart": {
                        "caption": that.ride.name,
                        "yAxisName": "Elevation (m)",
                        "theme": "fint"
                    },
                    "data": chartData
                }
            });

            //revenueChart.render();
        }

        function updateSegments(response) {
            that.ride = response.data;
            that.ride['duration'] = secondsToTime(that.ride.elapsed_time);
            console.log(that.ride);
        }

        function secondsToTime(s) {
            return new Date(1970, 0, 1).setSeconds(s);
        }

        init();
    }
})();