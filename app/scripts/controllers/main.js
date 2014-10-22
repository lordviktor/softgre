'use strict';

angular.module('greStatusApp')
  .controller('MainCtrl', function ($scope, $http, $timeout) {

    var lastSize = 0; 
  	var grep = "";
    var invert = 0;
    var itensPerPage = 20;

    $scope.logs = {
      currentPage: 0,
      pages: [[]]
    };

    $scope.lastLogs = [];
    $scope.source = [];

    $scope.goToPage = function(i) {
      $scope.logs.currentPage = i;
    }

    pool();

    function pool() {
      $timeout(function() {
        refreshInterfacestatus();
        refreshLogs();
        pool();
      }, 1000);
    }

    function refreshLogs() {
      $http.get('http://gre.oiwifi.com.br/softgre/index.php?action=log&ajax=1&lastsize='+ lastSize + '&grep=' + grep + '&invert=' + invert).then(function(response){
        lastSize = response.data.size;

        var lastPage = $scope.logs.pages[$scope.logs.pages.length - 1];

        angular.forEach(response.data.data, function(value) {
          lastPage.push(value);

          if(lastPage.length % itensPerPage === 0) {
            $scope.logs.pages.push([]);
            $scope.logs.currentPage = $scope.logs.pages.length - 1;
          }
        });

        $scope.source = $scope.source.concat(response.data.data);

        $scope.lastLogs = $scope.source.slice($scope.source.length - 1 - itensPerPage, $scope.source.length - 1);

        if($scope.logs.pages.length - $scope.logs.currentPage == 1) {
          //$scope.logs.currentPage = $scope.logs.pages.length - 1;
        }
      });
    }

    function refreshInterfacestatus() {
      $http.get('http://gre.oiwifi.com.br/softgre/api/tunnels').then(function(response){
        if(response.data.status == 'OK') {
          $scope.status = 'OK';
          $scope.attrs = response.data.body.split(';');
          var result = [];
          angular.forEach($scope.attrs, function(value){
            var temp = value.split('@');
            value = {
              ip: temp[0],
              interface: temp[1]
            };
            result.push(value);
          });
          $scope.attrs = result;
        } else {
          $scope.status = 'NOK';
          $scope.attrs = undefined;
        }
      });
    }
  });
