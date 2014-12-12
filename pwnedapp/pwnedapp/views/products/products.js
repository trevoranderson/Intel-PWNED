myApp.controller('ProductsController', ['$scope', '$route', '$filter', '$location', 'products', function($scope, $route, $filter, $location, products) {
  $scope.products = products;
  $scope.query = $route.current.params.query;
  $scope.site = $route.current.params.merchant;
  $scope.totalItems = $scope.products.length;
  $scope.currentPage = 1;
  $scope.maxSize = 5;
  $scope.indexMin = 0
  $scope.indexMax = 9;
  $scope.reverse = false;
  $scope.merchants = [];
  $scope.selectedMerchant = null;

  var orderBy = $filter('orderBy');

  angular.forEach(products, function (item) {
    var sites = $scope.merchants.map(function (site) {
      return site.site;
    });
    var index = sites.indexOf(item.scraperParams.site);
    if (index < 0) {
      $scope.merchants.push({
        site: item.scraperParams.site,
        count: 1
      });
    } else {
      $scope.merchants[index].count++;
    }
  });

  $scope.filterMerchant = function (site) {
    $location.path("/search/" + site + "/").search({query: $scope.query});
  };

  $scope.pageChanged = function() {
    $scope.indexMin = ($scope.currentPage - 1) * 10;
    $scope.indexMax = ($scope.currentPage * 10) - 1;
  }

  $scope.sortProducts = function(predicate, reverse) {
    $scope.products = orderBy($scope.products, predicate, reverse);
  };
}]);
