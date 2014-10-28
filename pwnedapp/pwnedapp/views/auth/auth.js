myApp.controller('LoginController', ['$scope', '$http', '$location', function($scope, $http, $location) {
  $scope.user = {};

  $scope.login = function() {
    var config = {
        'email' : $scope.user.email,
        'password' : $scope.user.password
    };

    $http.post("/login", config).success(function (data, status, header) {
        if (data.loginMessage) {
          $scope.message = data.loginMessage;
        } else {
          $location.path('/profile');
        }
    }).error(function (err) {
        console.log(err);
      });
  };
}]);

myApp.controller('SignupController', ['$scope', '$http', '$location', function($scope, $http, $location) {
  $scope.user = {};

  $scope.signup = function() {
    var config = {
      'email' : $scope.user.email,
      'password' : $scope.user.password
    };

    $http.post("/signup", config).success(function (data, status, header) {
      if (data.signupMessage) {
        $scope.message = data.signupMessage;
      } else {
        $location.path('/');
      }
    }).error(function () {
      console.log('error');
    });
  };
}]);