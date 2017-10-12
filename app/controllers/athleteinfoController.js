﻿(function() {
    var app = angular.module('strvr');

    app.controller('AthleteInfoController', AthleteInfoController);

    function AthleteInfoController($scope, AthleteFactory, NgMap) {

        var that = this;
        that.wind;
        that.athleteInfo;
        that.segments = [];
        that.test = [];
        that.test.push("hallo");
        that.selection=[];
        that.area=[];
        that.positions = [];
        that.leaderboard = [];
        that.gehad = [];
        that.center = "[51.438559, 5.414102]";
        that.athleteInfo = [];

        function init() {
            //that.PopulateSegments();
            $scope.speedval = 45;
            $scope.minspeedval = 37;
            $scope.mindistval = 300;
            $scope.maxdistval = 6000;
            $scope.maxelaval = 100;
            $scope.minwindsupport = 1;
        }

        that.PopulateSegments = function(area) {
            AthleteFactory.getSegmentsExplore(area)
                .then(UpdateSegments)
                .then(that.PopulateLeaderboard)
        };

        function UpdateSegments(response) {
            var countstuks = 0;
            //console.log(response.length);
            //console.log(JSON.stringify(response));
            //console.log(that.segments.length);
            that.segments = [];
            //console.log(that.segments.length);
            while(countstuks < response.length) {
                var count = 0;
                while (count < response[countstuks].data.segments.length) {
                                that.segments.push(response[countstuks].data.segments[count]);
                    count++;
                }
                countstuks++;
            }
            $scope.segments = that.segments;
        }

        $scope.speedf = function(n){
            var speed = (((n.entries[0].distance / n.entries[0].elapsed_time) * 3600)/1000  );

            //console.log(JSON.stringify(n.entries[0]))
            //console.log($scope.minspeedval)
            //console.log($scope.speedval)
            if ( speed > $scope.minspeedval && speed < $scope.speedval && n.windsupport > $scope.minwindsupport) {
                return true;
            } else {
                return false;
            }
        }


        that.getbounds  = function(){
            //console.log(that.segments.length);
            that.segments.length = 0;
            that.leaderboard.length = 0;
            that.area=[];
            that.behandeld=[];
            //console.log($scope.segments);
            //console.log(that.segments.length);
            //console.log('start');
            AthleteFactory.getWind(51.446757, 5.43491)
                .then(UpdateWind)
            NgMap.getMap().then(function (map) {
                that.positions = [];
                that.eara = [];
                //  X = Longitude, Y = Latitude
                var swla = parseFloat(map.getBounds().f.b.toString());
                var swlng = parseFloat(map.getBounds().b.b.toString());
                var nela = parseFloat(map.getBounds().f.f.toString());
                var nelng = parseFloat(map.getBounds().b.f.toString());
                var nelai = parseFloat(map.getBounds().f.f.toString());
                var nelngi = parseFloat(map.getBounds().b.f.toString());
                var countt = 0;
                var countlat = 0;
                var countlng = 0;
                var stuks = 6;
                var latinc = (swla-nela)/stuks;
                var lnginc = (swlng-nelng)/stuks;
                //vm.PopulateSegments(swla, swlng, nela,nelng);
                swla = nelai + latinc;
                swlng = nelngi + lnginc;

                while (countlng < stuks) {
                    countlat = 0;
                    nela = nelai -  latinc ;
                    swla = nelai;
                    while (countlat < stuks){ //y
                        swla +=  latinc;
                        nela +=  latinc;
                        console.log( " swla: " + swla + "swlng : " + swlng + "nela : "  + nela  + " nelng: " +   nelng);

                        that.area.push({ swla: swla - ((nela - swla)*2/3), swlng : swlng - ((nelng-swlng)*2/3), nela : nela,nelng : nelng});
                        countlat++;
                        countt++;
                    }
                    countlng++;
                    nelng +=  lnginc;
                    swlng += lnginc;
                }
                AthleteFactory.getSegmentsExplore(that.area).then(function(response) {
                    //console.log(JSON.stringify(response));
                    UpdateSegments(response)
                })
                    .then(that.PopulateLeaderboard)
            });

        }

        function UpdateWind(response) {
            // console.log(JSON.stringify(response.data.wind.deg));
            that.wind = JSON.stringify(response.data.wind.deg);
        }

        $scope.showCity = function(event, city) {
            $scope.selectedCity = city;
            $scope.map.showInfoWindow('myInfoWindow', this);
        };

        that.pinClicked = function(events, s) {
            console.log(s);
            that.selection.push(s);
          /*  var pos = marker.$index;
            NgMap.getMap().then(function (map) {
                console.log('the marker ->' + (map.markers[pos].b.s) + ' was clicked');
            });*/
        }

        that.PopulateLeaderboard = function() {
            var count = 0;
            that.leaderboard.length = 0;
            var uniekedata = [];
//            var behandeld = [];

            while (count < that.segments.length) {
            //    var idx = behandeld.indexOf(that.segments[count].id);
                //console.log(behandeld.indexOf(that.segments[count].id));
                var dist = that.segments[count].distance;
                var idx = that.behandeld.indexOf(that.segments[count].id);
                if (dist > $scope.mindistval && dist < $scope.maxdistval && idx == -1) {
                    that.behandeld.push(that.segments[count].id);
                    AthleteFactory.getLeaderboard(that.segments[count])
                        .then(function updateLeaderboard(response, headers) {
                            var direction = (google.maps.geometry.spherical.computeHeading(new google.maps.LatLng(response.config.end_latlng[0],response.config.end_latlng[1]), new google.maps.LatLng(response.config.start_latlng[0],response.config.start_latlng[1]))).toFixed(0);
                            if (direction < 0) {
                                direction = 360 + direction;
                            }
                            var newJson = $.extend({},
                                {idd: response.config.idd},
                                {segmentname: response.config.segmentname},
                                {sdistance: response.config.sdistance},
                                {pos: response.config.pos},
                                {start_latlng: response.config.start_latlng},
                                {end_latlng: response.config.end_latlng},
                                { windsupport : ((1 - (Math.abs((that.wind - (direction))))/360)* 100).toFixed(0)},
                                { direction : direction},
                                {points2: response.config.points},
                                {points: that.createpath2(JSON.stringify(google.maps.geometry.encoding.decodePath(response.config.points)))}
                                , response.data);
                            that.leaderboard.push(newJson);
                        })
                }
                count++;
            }
        };

        that.toggleSelection = function(leaderboard) {
            //console.log("test")
            var idx = that.selection.indexOf(leaderboard);
            //console.log(idx)
            if (idx > -1) {
                that.selection.splice(idx, 1);
            }
            // is newly selected
            else {
               //console.log(idx);
                that.selection.push(leaderboard);
              //  console.log(leaderboard.pos)
                that.center = leaderboard.pos;
            }
        }

        that.createpath2 = function(p){
            var p2;
            p2 = p.replace(/{/g,"[");
            p2 = p2.replace(/}/g,"]");
            p2 = p2.replace(/"lat":/g,"");
            p2 = p2.replace(/"lng":/g,"");
            return(p2);
        };


        init();
    }
})();