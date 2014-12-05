myApp.controller('ProductController', ['$scope', '$route', 'product', function($scope, $route, product) {
  $scope.product = product;
}]);
