(function() {
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

        that.GetWindSupport = function(n) {
            console.log(that.wind )
            console.log(Math.abs((that.wind - that.bearing(n.end_latlng[0],n.end_latlng[1],n.start_latlng[0],n.start_latlng[1]))))
            console.log(that.bearing(n.end_latlng[0],n.end_latlng[1],n.start_latlng[0],n.start_latlng[1]) )

            return Math.abs((that.wind - that.bearing(n.end_latlng[0],n.end_latlng[1],n.start_latlng[0],n.start_latlng[1])))
        }

        that.getbounds  = function(){
            //console.log(that.segments.length);
            that.segments.length = 0;
            that.leaderboard.length = 0;
            that.area=[];
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
                var swlai = parseFloat(map.getBounds().f.b.toString());
                var swlngi = parseFloat(map.getBounds().b.b.toString());
                var nelai = parseFloat(map.getBounds().f.f.toString());
                var nelngi = parseFloat(map.getBounds().b.f.toString());
                var countt = 0;
                var countlat = 0;
                var countlng = 0;
                var stuks = 2;
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
                        that.area.push({ swla: swla, swlng : swlng, nela : nela,nelng : nelng});
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
                if (dist > $scope.mindistval && dist < $scope.maxdistval) {
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

        that.getDegrees = function(lat1, long1, lat2, long2, headX) {

            var dLat = toRad(lat2-lat1);
            var dLon = toRad(lon2-lon1);

            lat1 = toRad(lat1);
            lat2 = toRad(lat2);

            var y = Math.sin(dLon) * Math.cos(lat2);
            var x = Math.cos(lat1)*Math.sin(lat2) -
                Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
            var brng = toDeg(Math.atan2(y, x));

            // fix negative degrees
            if(brng<0) {
                brng=360-Math.abs(brng);
            }

            return brng - headX;
        }

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

        that.test2 = function() {
            //console.log(that.bearing(51.3992,5.33873,51.384894,5.323158));
            //var path = [[51.3992,5.33873], [51.384894,5.323158]];
            var path = [];
            path.push(new google.maps.LatLng(51.3992,5.33873));
            path.push(new google.maps.LatLng(51.384894,5.323158));

            var heading = google.maps.geometry.spherical.computeHeading(path[0], path[1]);
            console.log(heading);
            console.log(360 + google.maps.geometry.spherical.computeHeading(new google.maps.LatLng(51.3992,5.33873), new google.maps.LatLng(51.384894,5.323158)))
            // AthleteFactory.getWind(51.446757, 5.43491)
           //     .then(UpdateWind)
        };

        function UpdateWind(response) {
           // console.log(JSON.stringify(response.data.wind.deg));
            that.wind = JSON.stringify(response.data.wind.deg);
        }

        that.bearing = function(lat1,lng1,lat2,lng2) {
            var dLon = (lng2-lng1);
            var y = Math.sin(dLon) * Math.cos(lat2);
            var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
            var brng = that._toDeg(Math.atan2(y, x));
            //console.log(360 - ((brng + 360) % 360));
            return 360 - ((brng + 360) % 360);
        }

        that._toRad = function(deg) {
            return deg * Math.PI / 180;
        }

        that._toDeg = function(rad) {
            return rad * 180 / Math.PI;
        }


        function updateAthleteInfo(response) {
            that.athleteInfo = response.data;
        }


        init();
    }
})();