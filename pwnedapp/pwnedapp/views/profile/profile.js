myApp.controller('ProfileController', ['$scope', '$http', '$location', '$cookies', '$timeout', 'profile', function($scope, $http, $location, $cookies, $timeout, profile) {

  $scope.watchlist = [];
  $scope.removed = [];

  if (!profile.data.user) {
    // User needs to log in
    $location.path('/login');
  }

  $scope.user = profile.data.user;

  $http.get("/watchlist").then(function (response) {
    $scope.watchlist = response.data;
  });

  $scope.unWatchItem = function (id, index) {
    $http.get("/watchlist/rm/" + id).then(function (response) {
      console.log(response.data.description);
      $timeout(function() {
        $scope.watchlist.splice(index, 1);
      });
    }, function(err) {
      console.log(err.data.description);
    });
  };

  $scope.names = [];
  var data = [];
  for (var i = 0; i < 100; i++) {
    data.push('item' + i)
  }
  $scope.add = function () {
    if (data.length) $scope.names.splice(0, 0, data.pop());
  };
  $scope.remove = function (index) {
    $scope.names.splice(index, 1);
  };
}]);
