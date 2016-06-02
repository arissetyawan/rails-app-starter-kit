var app = angular.module('App', [
  'templates', // Used by angular-rails-templates
  'ui.router',
  'ngResource',
  'ngAnimate',
  'ng-rails-csrf',
  'angularModalService',

  // Services
  'ArrayMetadataResponseAdapter',
  'Flash',
  'AuthSvc',
  'Post',
  'User',

  // Controllers
  'AppCtrl',
  'HomeCtrl',
  'AppSettingsCtrl',
  'PostsCtrl',
  'UsersCtrl',

  // Directives
  'ngTranscludeReplace',
  'AuthenticationLinks',
  'PleaseWait',
  'DataTable',
  'DateTimePicker',
  'Selectize',

  // Filters
  'StringFilters',
  'DateFilters',

  // Modules
  'RouteUtils',
  'FormBuilder',
  'QueryBuilder'
]);

app.config([
  'QBEditorProvider',
  function (QBEditorProvider) {
    QBEditorProvider.addEditorFactory({
      createEditorHtml: function (column, op) {
        if (column.type === 'date') {
          var editorHtml = '';
          var opArity = (op === 'range') ? 2 : 1;

          for (var i = 0; i < opArity; ++i) {
            editorHtml +=
              '<date-time-picker class="filter-value"'
                + ' ng-model="model.values[' + i + ']"'
                + ' options="{ format: \'LL\' }">' +
              '</date-time-picker>'
          }

          return editorHtml;
        }
      }
    });
  }]);
