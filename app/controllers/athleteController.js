(function() {
    var app = angular.module('strvr');

    app.controller('AthleteController', AthleteController);

    function AthleteController($scope, AthleteFactory) {

        var that = this;
        that.activities = [];
        that.page = null;
        that.per_page = 10;
        that.athleteInfo;

        that.populateActivities = function() {
            AthleteFactory.getActivities(that.page, that.per_page)
                .then(updateActivities);
        }

        that.nextPage = function() {
            that.page++;
            that.populateActivities();
        }

        that.previousPage = function() {
            if (that.page > 1){
                that.page = Math.max(1, that.page - 1);
                that.populateActivities();
            }
        }

        function init() {
            that.page = 1;
            that.populateActivities();
            that.PopulateAthleteInfo();
        }

        function updateActivities(response) {
            var count = 0;
            that.activities = [];
            while (count < response.data.length) {
                that.activities.push(response.data[count]);
                count++;
            }
        }

        that.PopulateAthleteInfo = function(response) {
            console.log('getinfo');
            AthleteFactory.getInfo()
                .then(updateAthleteInfo)
        }

        function updateAthleteInfo(response) {
            that.athleteInfo = response.data;
            console.log(that.athleteInfo);
        }

        init();
    }

})();