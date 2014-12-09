myApp.controller('ProductsController', ['$scope', '$route', '$filter', 'products', function($scope, $route, $filter, products) {
  $scope.products = products;
  $scope.query = $route.current.params.query;
  $scope.totalItems = $scope.products.length;
  $scope.currentPage = 1;
  $scope.maxSize = 5;
  $scope.indexMin = 0
  $scope.indexMax = 9;
  $scope.reverse = false;

  var orderBy = $filter('orderBy');

  $scope.pageChanged = function() {
    $scope.indexMin = ($scope.currentPage - 1) * 10;
    $scope.indexMax = ($scope.currentPage * 10) - 1;
  }

  $scope.sortProducts = function(predicate, reverse) {
    $scope.products = orderBy($scope.products, predicate, reverse);
  };
}]);
