(function() {
    var app = angular.module('strvr', ['ngRoute'] );

    app.config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'AthleteController',
                controllerAs: 'ac',
                templateUrl: 'app/views/athlete.html'
            })
            .when('/activity/:activityId', {
                controller: 'ActivityController',
                controllerAs: 'rc',
                templateUrl: 'app/views/activities.html'
            })
            .when('/test/', {
                controller: 'AthleteInfoController',
                controllerAs: 'ac',
                templateUrl: 'app/views/test.html'
            })
    });

})();