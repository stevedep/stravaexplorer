(function() {
    var app = angular.module('strvr');

    app.controller('AthleteInfoController', AthleteInfoController);

    function AthleteInfoController($scope, AthleteFactory, NgMap) {

        var that = this;

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
            console.log(that.segments.length);
            that.segments = [];
            console.log(that.segments.length);
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
            if ( speed > $scope.minspeedval && speed < $scope.speedval) {
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
            console.log($scope.segments);
            //console.log(that.segments.length);
            //console.log('start');
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
                var stuks = 4;
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
                            var newJson = $.extend({},
                                {idd: response.config.idd},
                                {segmentname: response.config.segmentname},
                                {pos: response.config.pos},
                                {points2: response.config.points},
                                {points: that.createpath2(JSON.stringify(google.maps.geometry.encoding.decodePath(response.config.points)))}
                                , response.data);
                            that.leaderboard.push(newJson);
                        })
                }
                count++;
            }
        };

        function getDegrees(lat1, long1, lat2, long2) {

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

            return brng;
        }

        that.toggleSelection = function(leaderboard) {
            console.log("test")
            var idx = that.selection.indexOf(leaderboard);
            console.log(idx)
            if (idx > -1) {
                that.selection.splice(idx, 1);
            }
            // is newly selected
            else {
               console.log(idx);
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


        function updateAthleteInfo(response) {
            that.athleteInfo = response.data;
        }


        init();
    }
})();