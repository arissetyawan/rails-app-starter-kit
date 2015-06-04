/*
 * To create concrete viewers for the "abstract" attachment-viewer directive.
 * Can be configured by adding user-defined viewer factories.
 *
 * Configuration:
 *   app.config(['AttachmentViewerProvider',
 *     function (AttachmentViewerProvider) {
 *       AttachmentViewerProvider.addViewerFactory({
 *         createViewerHtml: function (attachment) {
 *           // Return some suitable HTML.
 *           // This may contain Angular directives, since it is compiled before
 *           // being added to the DOM.
 *         }
 *       });
 *
 *     // Add more factories if required.
 *     // The order of addition matters, since factories are tried in order of
 *     // their addition, and the first one that returns some HTML wins.
 *   }]);
 */
angular.module('AttachmentViewerProvider', [])
  .provider('AttachmentViewer', [
    function () {
      /**
       * Creates a default viewer.
       *
       * @param attachment {object} - The attachment.
       *
       * @returns {string} The viewer HTML. It may contain Angular directives,
       * since it is compiled before being added to the DOM.
       */
      function DEFAULT_VIEWER_HTML (attachment) {
        var viewerHtml =
          '<a href="' + attachment.access_url + '">'
            + 'Download' +
          '</a>';

        return viewerHtml;
      }

      // The list of user defined viewer factories
      var viewerFactories = [];

      /**
       * Adds a viewer factory.
       * The order of addition is important, since viewer creation is tried in
       * the same order.
       *
       * @param factory {{createViewerHtml: function(object)}} - Where the
       * function must:
       * * accept an attachment object containing various useful details about
       *   the attachment
       * * return a string containing the viewer's HTML, or null
       */
      function addViewerFactory (factory) {
        viewerFactories.push(factory);
      }

      /**
       * Gets the viewer HTML as generated by the registered factories.
       * Falls back on a default viewer if the user defined factories (tried in
       * order of their addition) fail.
       *
       * @param attachment {object} - The attachment.
       *
       * @returns {string} The viewer HTML.
       */
      function getViewerHtml (attachment) {
        for (var i = 0;i < viewerFactories.length; ++i) {
          var viewer = viewerFactories[i].createViewerHtml(attachment);

          if (viewer) {
            return viewer;
          }

          return DEFAULT_VIEWER_HTML(attachment);
        }
      }

      // Return the provider object
      return {
        addViewerFactory: addViewerFactory,

        // The service object
        $get: function () {
          return {
            getViewerHtml: getViewerHtml
          };
        }
      };
    }]);