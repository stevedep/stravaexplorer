(function () {
    var app = angular.module('strvr');

    app.factory('AthleteFactory', AthleteFactory);

    function AthleteFactory($http) {

        var athleteId = "13077";
        var accessToken = "";

        var gotActivities = false;

        return {
            getActivities: getActivities,
            getSegments: getSegments,
            getInfo : getInfo,
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

        function getSegmentsExplore() {
            return $http({
                method: 'JSONP',
                url: "https://www.strava.com/api/v3/segments/explore"
                + "?bounds=51.389506,5.329227,51.505477,5.580883"
                + "&access_token=" + accessToken
                + "&callback=JSON_CALLBACK"
            });
        }

        function getLeaderboard(segmentobject) {
            //console.log("segmentid:" + segmentid);
/*
            $http({
                method: 'GET',
                url: '/someUrl'
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
*/

            return $http({
                method: 'JSONP',
                 url: "https://www.strava.com/api/v3/segments/"+ segmentobject.id +"/leaderboard"
                + "?access_token=" + accessToken + "&per_page=2"
                 + "&callback=JSON_CALLBACK",
                idd: segmentobject.id,
                segmentname: segmentobject.name
            });

        }




    }

})();
