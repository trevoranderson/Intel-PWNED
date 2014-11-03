myApp.controller('ProfileController', ['$scope', '$http', '$location', '$cookies', 'profile', function($scope, $http, $location, $cookies, profile) {

  if (!profile.data.user) {
    // User needs to log in
    $location.path('/login');
  }

  $scope.user = profile.data.user;

}]);
