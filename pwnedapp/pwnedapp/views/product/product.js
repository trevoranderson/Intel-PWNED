myApp.controller('ProductController', ['$scope', '$route', '$http', 'product', function($scope, $route, $http, product) {
  $scope.product = product;
  $scope.inWatchList = false;

  if (window.localStorage['recentlyViewed']) {
    var recentlyViewed = angular.fromJson(window.localStorage['recentlyViewed']);
  } else {
    var recentlyViewed = [];
  }

  var ids = recentlyViewed.map(function (product) {
    return product._id;
  });

  if(ids.indexOf(product._id) < 0 ) {
    if (recentlyViewed.length >= 6) {
      recentlyViewed.splice(0,1);
    }
    recentlyViewed.push(product);
    window.localStorage['recentlyViewed'] = JSON.stringify(recentlyViewed);
  }

  // Determine if item is being watched
  $http.get("/watchlist").then(function (response) {
    if (response.data.length > 0) {
      var list = response.data.map(function (product) {
        return product._id;
      });
      if (list.indexOf(product._id) > -1) {
        $scope.inWatchList = true;
      }
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
