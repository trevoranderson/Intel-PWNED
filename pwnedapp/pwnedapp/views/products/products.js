myApp.controller('ProductsController', ['$scope', '$route', 'products', function($scope, $route, products) {
  $scope.products = products;
  $scope.query = $route.current.params.query;
  $scope.totalItems = $scope.products.length;
  $scope.currentPage = 1;
  $scope.maxSize = 5;
  $scope.indexMin = 0
  $scope.indexMax = 9;

  var maxPage = 5; // Fetch results from maxPage-5 to maxPage

  $scope.pageChanged = function() {
    $scope.indexMin = ($scope.currentPage - 1) * 10;
    $scope.indexMax = ($scope.currentPage * 10) - 1;
  }
}]);
