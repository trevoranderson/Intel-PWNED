myApp.controller('LoginController', ['$scope', '$http', function($scope, $http) {
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

myApp.controller('SignupController', ['$scope', '$http', function($scope, $http) {
  $scope.user = {};

  $scope.signup = function() {
    var config = {
      'email' : $scope.user.email,
      'password' : $scope.user.password
    };

    $http.post("/signup", config).success(function (data, status, header) {
      if (data.signupMessage) {
        $scope.message = data.signupMessage;
      }
    }).error(function () {
      console.log('error');
    });
  };
}]);