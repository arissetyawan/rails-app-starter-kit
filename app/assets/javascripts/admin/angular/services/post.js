// Manages the Post resource on the server.
angular.module('Post', ['I18n'])
  .factory('Post', [
    '$resource', 'I18n',
    function($resource, I18n) {
      return $resource(
        '/admin/:locale/posts/:collectionAction/:postId/:memberAction.json',
        {
          postId: '@id',
          locale: function () { return I18n.getLocale(); }
        },
        // Extra methods for compatibility with Rails, and our data format
        {
          batch_destroy: {
            method: 'POST',
            params: { collectionAction: 'batch_destroy' }
          }
        });
    }]);
