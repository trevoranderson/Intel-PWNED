myApp.controller('ProductController', ['$scope', '$route', '$http', 'product', function($scope, $route, $http, product) {
  $scope.product = product;
  $scope.inWatchList = false;

  // Determine if item is being watched
  $http.get("/watchlist").then(function (response) {
    if (response.data.length > 0) {
      $scope.inWatchList = true;
    }
  });

  $scope.watchItem = function () {
    $http.get("/watchlist/add/" + product._id).then(function (response) {
      console.log(response.data.description);
      $scope.inWatchList = true;
    }, function(err) {
      console.log(err.data.description);
    });
  };

  $scope.unWatchItem = function () {
    $http.get("/watchlist/rm/" + product._id).then(function (response) {
      console.log(response.data.description);
      $scope.inWatchList = false;
    }, function(err) {
      console.log(err.data.description);
    });
  }
}]);
