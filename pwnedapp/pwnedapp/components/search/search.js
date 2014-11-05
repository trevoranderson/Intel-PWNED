myApp.controller('SearchController', ['$scope', '$http', function($scope, $http) {

  $scope.searchTypeahead = function (value) {
    return $http.get("/products/search/"+value).then(function (response) {
      return response.data.map(function(item){
        return item.name;
      });
    });
  }

}]);