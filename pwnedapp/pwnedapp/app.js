'use strict';

// TODO: merge with stuff in the /routes folder !

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', ['ngRoute', 'ngCookies']
).config(['$routeProvider', '$locationProvider',  function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.when('/login', {
    templateUrl: 'views/auth/login.ejs',
    controller: 'LoginController'
  }).when('/signup', {
    templateUrl: 'views/auth/signup.ejs',
    controller: 'SignupController'
  }).when('/profile', {
    templateUrl: 'views/profile/profile.ejs',
    resolve: {
      profile: ['$http', function ($http) {
        return $http.post('/profile');
      }]
    },
    controller: 'ProfileController'
  }).otherwise({
    templateUrl: 'views/home.html'
  });
}]).run(function($rootScope, $http, $location) {
  $rootScope.loggedIn = false;

  $http.post('/api/loggedIn').success(function (data) {
    if (data.email) {
      $rootScope.loggedIn = true;
    }
  });

  $rootScope.logout = function () {
    $http.post('/api/logout').success(function (data) {
      $rootScope.loggedIn = false;
      $location.path('/');
    });
  }
});
