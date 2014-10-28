myApp.controller('LoginController', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
  $scope.user = {};

  $scope.login = function() {
    var config = {
        'email' : $scope.user.email,
        'password' : $scope.user.password
    };

    $http.post("/login", config).success(function (data) {
        if (data.loginMessage) {
          $scope.message = data.loginMessage;
        } else {
          $rootScope.loggedIn = true;
          $location.path('/profile');
        }
    }).error(function (err) {
        console.log(err);
      });
  };
}]);

myApp.controller('SignupController', ['$rootScope','$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
  $scope.user = {};

  $scope.signup = function() {
    var config = {
      'email' : $scope.user.email,
      'password' : $scope.user.password
    };

    $http.post("/signup", config).success(function (data) {
      if (data.signupMessage) {
        $scope.message = data.signupMessage;
      } else {
        $rootScope.loggedIn = true;
        $location.path('/');
      }
    }).error(function () {
      console.log('error');
    });
  };
}]);