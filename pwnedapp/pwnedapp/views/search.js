myApp.controller('SearchController', ['$scope', '$http', '$location', function($scope, $http, $location) {

  $scope.searchTypeahead = function (value) {
    if (value.length > 0) {
      return $http.get("/products/search/" + value).then(function (response) {
        return response.data.map(function (item) {
          return item.name;
        });
      });
    }
  }

  $scope.search = function (query) {
    $location.path("/search").search({query: query});
  }
}]);