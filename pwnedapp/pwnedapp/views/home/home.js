myApp.controller('HomeController', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
  $scope.watchlist = [];
  $scope.recentlyViewed = angular.fromJson(window.localStorage['recentlyViewed']);

  if ($rootScope.loggedIn) {
    $http.get("/watchlist").then(function (response) {
      $scope.watchlist = response.data;
    }, function (err) {
      console.log(err);
    });
  }
}]);
