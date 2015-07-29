// The directive for a single filter in a query-builder.
angular.module('QBFilter', ['QBEditorProvider'])
  .directive('qbFilter', [
    '$compile', 'QBEditor',
    function ($compile, QBEditor) {
      return {
        restrict: 'E',
        templateUrl: 'shared/directives/qb_filter.html',

        scope: {
          qbOptions: '=', // The options passed to query-builder
          model: '='
        },

        link: function (scope, element, attrs) {
          //////////////////
          // Helper Stuff //
          //////////////////

          // Default comparison operators
          var DEFAULT_OPS = ['contains', '=', '<', '<=', '>', '>=', 'range'];

          // Column type based refinements to DEFAULT_OPS.
          // Add more rules as and when more column types are supported.
          var ALLOWED_OPS = {
            date: { except: ['contains'] },
            select: { only: ['='] }
          };

          // For preserving editor values across filter operator changes
          var editorCache = {};

          /**
           * Returns a column from qbOptions, given its name.
           *
           * @param columnName {string} - A column name.
           *
           * @returns {Object} The column.
           *
           * @throws An error if no column found by the given name.
           */
          function getColumn (columnName) {
            for (var i = 0; i < scope.qbOptions.columns.length; ++i) {
              var column = scope.qbOptions.columns[i];

              if (column.name === columnName) {
                return column;
              }
            }

            throw 'Column ' + columnName + ' not found';
          }

          /**
           * Returns a list of allowed operators, given a column type.
           *
           * @param columnType {string} - A column type.
           *
           * @returns {string[]} The array of allowed operators, or the entire
           * DEFAULT_OPS if no refinement rules have been specified via
           * ALLOWED_OPS.
           */
          function getAllowedOps (columnType) {
            var rules = ALLOWED_OPS[columnType];

            if (rules) {
              if (rules.only) {
                return rules.only;
              } else if (rules.except) {
                return _.difference(DEFAULT_OPS, rules.except);
              }
            }

            return DEFAULT_OPS;
          }

          /**
           * Sets the value editor, based on:
           * * The type of the column selected
           * * The operator selected
           *
           * @param columnType {string} - A column type.
           * @param op {string} - An operator.
           */
          function setEditor (columnType, op) {
            var editorContainer = $(element).find('.filter-values');

            editorContainer.html('');

            var editorHtml = QBEditor.getEditorHtml(columnType, op);
            editorContainer.html(editorHtml);

            // Note: We compile the control AFTER inserting into the DOM. This
            // way the control registers itself with the parent form, which is
            // required for the various form states ('$dirty' etc.) and
            // validation to work.
            $compile(editorContainer.contents())(scope);
          }

          //////////////////////
          // Procedural Stuff //
          //////////////////////

          scope.ops = DEFAULT_OPS;

          if (!scope.model.values) {
            scope.model.values = [];
          }

          scope.$watch('model.column', function (value) {
            var ops = getAllowedOps(getColumn(value).type);

            // If the new ops list does not contain the currently selected op,
            // un-select the current op, else ngOptions acts up!
            if (scope.model.op && !_.contains(ops, scope.model.op)) {
              scope.model.op = null;
            }

            scope.ops = ops;

            if (!scope.model.op) {
              scope.model.op = scope.ops[0];
            }
          });

          scope.$watch('[model.column, model.op]',
            function (newValue, oldValue) {
              if (oldValue[0] && oldValue[1]) {
                // Cache the value of the editor going out
                editorCache[oldValue[0]] = scope.model.values;
              }

              if (newValue[0] && newValue[1]) {
                // Expose this filter's qbOptions column on the scope, for
                // editors to use if they require (for example, for the list of
                // options for a select tag).
                scope.column = getColumn(newValue[0]);

                // Load the value for the editor coming in
                scope.model.values = editorCache[newValue[0]] || [];

                setEditor(scope.column.type, newValue[1]);
              }
            }, true);
        }
      };
    }]);
