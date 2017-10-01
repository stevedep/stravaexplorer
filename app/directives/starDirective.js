(function () {
    var app = angular.module('strvr');

    app.directive('threeStar', threeStar);

    function threeStar(){
        return {
            restrict: 'A',
            templateUrl: './app/directives/threeStar.html',
            scope: {
                stars: '@'
            }
        }
    }
})();