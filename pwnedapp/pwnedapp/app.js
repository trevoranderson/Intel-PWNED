'use strict';

// TODO: merge with stuff in the /routes folder !

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', ['ngRoute', 'ngCookies', 'ui.bootstrap', 'ngAnimate']
).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true);
  $routeProvider.when('/login', {
    templateUrl: 'views/auth/login.ejs',
    controller: 'LoginController'
  }).when('/signup', {
    templateUrl: 'views/auth/signup.ejs',
    controller: 'SignupController'
  }).when('/profile', {
    templateUrl: 'views/profile/profile.html',
    resolve: {
      profile: ['$http', function ($http) {
        return $http.post('/profile');
      }]
    },
    controller: 'ProfileController'
  }).when('/item/:id', {
    templateUrl: 'views/product/product.html',
    resolve: {
      product: ['$http', '$route', function ($http, $route) {
        return $http.get("/products/"+$route.current.params.id).then(function (response) {
          return response.data;
        });
      }]
    },
    controller: 'ProductController'
  }).when('/search', {
    templateUrl: 'views/products/products.html',
    resolve: {
      products: ['$http', '$route', '$filter', function ($http, $route, $filter) {
        var query = $route.current.params.query;
        var orderBy = $filter('orderBy');
        return $http.get("/products/search/"+query).then(function (response) {
          var sorted = orderBy(response.data, 'price', false);
          return sorted;
        });
      }]
    },
    controller: 'ProductsController'
  }).when('/search/:merchant', {
    templateUrl: 'views/products/products.html',
    resolve: {
      products: ['$http', '$route', '$filter', function ($http, $route, $filter) {
        var query = $route.current.params.query;
        var site = $route.current.params.merchant;
        var orderBy = $filter('orderBy');
        return $http.get("/products/search/"+site+"/"+query).then(function (response) {
          var sorted = orderBy(response.data, 'price', false);
          return sorted;
        });
      }]
    },
    controller: 'ProductsController'
  }).otherwise({
    templateUrl: 'views/home/home.html',
    controller: 'HomeController'
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
