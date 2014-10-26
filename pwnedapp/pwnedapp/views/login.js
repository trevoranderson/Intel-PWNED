myApp.controller('LoginController', ['$scope', '$http', function($scope, $http) {
  $scope.error = {};
  $scope.user = {};

  $scope.login = function() {
    var config = {
        'email' : $scope.user.email,
        'password' : $scope.user.password
    };

    $http.post("/login", config).success(function (data, status, header) {
        if (data.loginMessage) {
          $scope.message = data.loginMessage;
        }
    }).error(function () {
        console.log('error');
      });
  };
}]);