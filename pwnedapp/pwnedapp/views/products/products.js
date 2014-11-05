myApp.controller('ProductsController', ['$scope', '$route', 'products', function($scope, $route, products) {
  $scope.products = products;
  $scope.query = $route.current.params.query;
}]);
