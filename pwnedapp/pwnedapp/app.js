'use strict';

// TODO: merge with stuff in the /routes folder !

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.when('/login', {
    templateUrl: 'views/login.ejs'
  }).when('/signup', {
    templateUrl: 'views/signup.ejs'
  }).when('/profile', {
    templateUrl: 'views/profile.ejs'
  }).otherwise({
    templateUrl: 'views/home.html'
  });;
}]);
