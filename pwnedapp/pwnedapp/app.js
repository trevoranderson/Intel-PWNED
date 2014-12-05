'use strict';

// TODO: merge with stuff in the /routes folder !

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', ['ngRoute', 'ngCookies', 'ui.bootstrap']
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
  }).when('/item/:id', {
    templateUrl: 'views/product/product.html',
    resolve: {
      product: ['$http', '$route', function ($http, $route, $stateParams) {
        return $http.get("/products/"+$stateParams.id).then(function (response) {
          return response.data;
        });
      }]
    },
    controller: 'ProductController'
  }).when('/search', {
    templateUrl: 'views/products/products.html',
    resolve: {
      products: ['$http', '$route', function ($http, $route) {
        var query = $route.current.params.query;
        return $http.get("/products/search/"+query).then(function (response) {
          return response.data;
        });
      }]
    },
    controller: 'ProductsController'
  }).otherwise({
    templateUrl: 'views/home.html'
  });
}]).run(['$rootScope', '$http', '$location', function($rootScope, $http, $location) {
  $rootScope.loggedIn = false;

  $rootScope.$on('$routeChangeStart', function() {
    $rootScope.showSearch = $location.path() !== '/';
  });

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
}]);
