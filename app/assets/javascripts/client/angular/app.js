/*
 * Angular entry point.
 * Include all other modules here.
 */
var app = angular.module('App', [
  'templates', // Used by angular-rails-templates
  'ui.router',
  'ngAnimate',
  'ng-rails-csrf',
  'flashular',

  // Services
  'AuthSvc',
  'Post',

  // Controllers
  'AppCtrl',
  'HomeCtrl',
  'PostsCtrl',
  'AttachmentsCtrl',

  // Directives
  'ngTranscludeReplace',
  'AuthenticationLinks',
  'PleaseWait',
  'DateTimePicker',
  'JWPlayer',
  'GDocsViewer',

  // Filters
  'StringFilters',
  'DateFilters',

  // Modules
  'RouteUtils',
  'ResourceUtils',
  'FormBuilder',
  'AttachmentLibrary'
]);

app.config([
  'QBEditorProvider', 'AttachmentViewerProvider',
  function (QBEditorProvider, AttachmentViewerProvider) {
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

    AttachmentViewerProvider.addViewerFactory({
      createViewerHtml: function (attachment) {
        if (attachment.web_viewer_type === 'video') {
          var viewerOptions = {
            playlist: [{
              sources: [{
                file: attachment.access_url
              }]
            }]
          };

          var viewerOptionsStr =
            _.replaceAll(JSON.stringify(viewerOptions), '"', "'");

          var viewerHtml =
            '<div jw-player id="video-player"'
              + 'options="' + viewerOptionsStr + '">' +
            '</div>';

          return viewerHtml;
        }
      }
    });

    AttachmentViewerProvider.addViewerFactory({
      createViewerHtml: function (attachment) {
        if (attachment.web_viewer_type === 'g_docs_published') {
          var viewerHtml =
            '<g-docs-viewer url="attachment.access_url"></g-docs-viewer>';

          return viewerHtml;
        }
      }
    });
  }]);
