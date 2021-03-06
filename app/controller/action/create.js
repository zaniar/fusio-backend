'use strict';

module.exports = function($scope, $http, $uibModalInstance, $compile, formBuilder, fusio) {

  $scope.action = {
    name: "",
    class: "",
    engine: "Fusio\\Engine\\Factory\\Resolver\\PhpClass",
    config: {}
  };
  $scope.elements = [];
  $scope.config = {};
  $scope.actions = [];
  $scope.class = "";

  $scope.create = function(action) {
    var data = angular.copy(action);
    
    if (!data.class) {
      data.class = $scope.class;
    }

    if (angular.isObject($scope.config)) {
      data.config = formBuilder.postProcessModel($scope.config, $scope.elements);
    }

    $http.post(fusio.baseUrl + 'backend/action', data)
      .then(function(response) {
        var data = response.data;
        $scope.response = data;
        if (data.success === true) {
          $uibModalInstance.close(data);
        }
      })
      .catch(function(response) {
        $scope.response = response.data;
      });
  };

  $http.get(fusio.baseUrl + 'backend/action/list')
    .then(function(response) {
      var data = response.data;
      $scope.actions = data.actions;

      $scope.actions.unshift({
        "name": "PHP-Class",
        "class": ""
      });

      if (data.actions[0]) {
        $scope.action.class = data.actions[0].class;
        $scope.loadConfig();
      }
    });

  $scope.close = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.closeResponse = function() {
    $scope.response = null;
  };

  $scope.loadConfig = function() {
    if ($scope.action.class) {
      $http.get(fusio.baseUrl + 'backend/action/form?class=' + encodeURIComponent($scope.action.class))
        .then(function(response) {
          var data = response.data;
          var containerEl = angular.element(document.querySelector('#config-form'));
          containerEl.children().remove();

          $scope.elements = data.element;
          $scope.config = formBuilder.preProcessModel($scope.action.config, $scope.elements);
          var linkFn = formBuilder.buildHtml($scope.elements, 'config');
          if (angular.isFunction(linkFn)) {
            var el = linkFn($scope);
            containerEl.append(el);
          }
        });
    } else {
          var containerEl = angular.element(document.querySelector('#config-form'));
          containerEl.children().remove();

          containerEl.append('<label for="class">Class Name:</label>');
          containerEl.append('<input type="text" id="class-name" ng-model="class" aria-describedby="classHelp" class="form-control">');
          containerEl.append('<span class="help-block" id="classHelp"></span>');

          $compile(angular.element(document.querySelector('#class-name')))($scope);
    }
  };
  
  $scope.aceLoaded = function(_editor){
    var _session = _editor.getSession();
	  _session.setMode({path:_session.getMode().$id, inline: true});
  };

};
