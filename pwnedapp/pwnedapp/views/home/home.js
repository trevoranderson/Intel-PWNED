myApp.controller('HomeController', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
  $scope.watchlist = [];
  $scope.recentlyViewed = [];

  if (window.localStorage['recentlyViewed'].length > 0) {
    $scope.recentlyViewed = angular.fromJson(window.localStorage['recentlyViewed']);
  }

  if ($rootScope.loggedIn) {
    $http.get("/watchlist").then(function (response) {
      $scope.watchlist = response.data;
    }, function (err) {
      console.log(err);
    });
  }

  $scope.clearRecentlyViewed = function () {
    window.localStorage['recentlyViewed'] = [];
    $scope.recentlyViewed = [];
  };

}]);
