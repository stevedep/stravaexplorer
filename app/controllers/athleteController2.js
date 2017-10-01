(function() {
    var app = angular.module('strvr');

    app.controller('AthleteController2', AthleteController2);

    function AthleteController2($scope, AthleteFactory) {

        var that = this;
        that.activities = [];
        that.page = null;
        that.per_page = 10;

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
        }

        function updateActivities(response) {
            var count = 0;
            that.activities = [];
            while (count < response.data.length) {
                that.activities.push(response.data[count]);
                count++;
            }
        }

        init();
    }

})();