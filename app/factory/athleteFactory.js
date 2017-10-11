(function () {
    var app = angular.module('strvr');

    app.factory('AthleteFactory', AthleteFactory);

    function AthleteFactory($http, $q) {

        var athleteId = "13077";
        var accessToken = "b39f139a27a98749674c44b550aabb87c9a8b020";

        var gotActivities = false;

        return {
            getActivities: getActivities,
            getSegments: getSegments,
            getInfo : getInfo,
            getWind : getWind,
            getSegmentsExplore : getSegmentsExplore,
            getLeaderboard : getLeaderboard
        };

        function getActivities(page, per_page) {
            console.log('Getting page ' + page + ' of most recent activities');
            return $http({
                method: 'JSONP',
                url: "https://www.strava.com/api/v3/activities?"
                    + "id=" + athleteId
                    + "&per_page=" + per_page
                    + "&page=" + page
                    + "&access_token=" + accessToken
                    + "&callback=JSON_CALLBACK"
            });
        }

       function getSegments(activityId) {
            console.log('Getting detailed ride for ' + activityId);
            return $http({
                method: 'JSONP',
                url: "https://www.strava.com/api/v3/activities/" + activityId
                    + "?access_token=" + accessToken
                    + "&callback=JSON_CALLBACK"
            });
       }

        function getInfo() {
                console.log('Getting althlete data of ' + athleteId);
                return $http({
                    method: 'JSONP',
                    url: "https://www.strava.com/api/v3/athletes/" + athleteId
                    + "?access_token=" + accessToken
                    + "&callback=JSON_CALLBACK"
                });
            }

        function getSegmentsExplore(areas) {
            var promises = [];
            var count=0;
            while (count < areas.length) { //y
                promises.push($http({
                    method: 'JSONP',
                    url: "https://www.strava.com/api/v3/segments/explore"
                    + "?bounds="+areas[count].swla+","+areas[count].swlng+","+areas[count].nela+","+areas[count].nelng
                    + "&activity_type=riding"
                    + "&max_cat=1"
                    + "&access_token=" + accessToken
                    + "&callback=JSON_CALLBACK"
                }))
                count++
            }
            return $q.all(promises)
                .then(function(response) {
                  //  console.log(JSON.stringify(response));
                    return response;
                })
        }


        function getLeaderboard(segmentobject) {
            return $http({
                method: 'JSONP',
                 url: "https://www.strava.com/api/v3/segments/"+ segmentobject.id +"/leaderboard"
                + "?access_token=" + accessToken + "&per_page=6"
                 + "&callback=JSON_CALLBACK",
                idd: segmentobject.id,
                segmentname: segmentobject.name,
                pos : segmentobject.start_latlng,
                points : segmentobject.points,
                sdistance : segmentobject.distance,
                start_latlng : segmentobject.start_latlng,
                end_latlng : segmentobject.end_latlng
            });

        }

        function getWind(lat, long) {
            return $http({
                method: 'get',
                url: "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long+"&APPID=58e9ba1a496bd20f7e11bfd8464c06c7"
            });

        }

    }

})();
