angular.module('UsersCtrl', ['User'])
  .controller('UsersCtrl', [
    '$scope', '$location', 'flash', 'User', 'initialData',
    function($scope, $location, flash, User, initialData) {
      /**
       * Allowed user roles.
       */
      var USER_ROLE_OPTIONS = [
        { label: 'Admin', value: 'admin' },
        { label: 'Moderator', value: 'moderator' }
      ];

      /**
       * The 'index' action.
       */
      $scope.actionIndex = function () {
        $scope.dataTableOptions = {
          serverSide: true,
          ajax: {
            url: '/admin/users.json',
            // Just add the query builder filters to all AJAX requests sent by
            // the data table!
            data: function (d) {
              d.filters = $scope.queryBuilderFilters;
            }
          },
          searching: false, // Since we are using query builder
          processing: true, // Show the 'processing' indicator
          columns: [
            { data: 'id' },
            { data: 'email' },
            { data: 'roles',
              searchable: false, orderable: false,
              render: function (data, type, row, meta) {
                return _.map(data, function (role) {
                  return _.titleize(_.humanize(role));
                }).join(', ')
              }
            },
            { data: 'created_at',
              render: function (data, type, row, meta) {
                return moment(data).format('lll');
              }
            },
            { data: 'confirmed_at',
              render: function (data, type, row, meta) {
                return (data) ? moment(data).format('lll') : 'Pending';
              }
            },
            { // data: 'actions', // Not really required for this column!
              searchable: false, orderable: false,
              className: 'dt-body-center',
              render: function (data, type, row, meta) {
                var editHtml =
                  '<a href="/admin/#/users/' + row.id + '/edit">'
                    + '<span class="glyphicon glyphicon-pencil"></span>' +
                  '</a>';

                var deleteHtml =
                  '<a ng-click="deleteUser(' + row.id + ')">'
                    + '<span class="glyphicon glyphicon-remove"></span>' +
                  '</a>';

                return editHtml + '&nbsp;' + deleteHtml;
              }
            }
          ],
          stateSave: true, // Ensure table element has an id for this to work!
          // Save/load the query builder state along with the table state
          stateSaveParams: function (settings, data) {
            data.filters = $scope.queryBuilderFilters;
          },
          stateLoadParams: function (settings, data) {
            $scope.queryBuilderFilters = data.filters;
          }
        };

        // The 'raw' data table instance.
        // This is populated by the 'datatable' directive.
        $scope.dataTableInstance = null;

        // To enable row selection
        $scope.dataTableSelectedRows = [];

        // For bulk operations on currently selected rows
        $scope.dataTableBulkOps = {
          deleteAll: {
            name: 'Delete All',
            action: function () {
              User.batch_destroy({}, { ids: $scope.dataTableSelectedRows },
                function (success) {
                  $scope.dataTableInstance.ajax.reload(); // Reload table data
                  $scope.dataTableSelectedRows.length = 0;
                },
                function (failure) {
                  console.log(failure);
                }
              )
            }
          }
        };

        $scope.queryBuilderOptions = {
          columns: [
            { name: 'email', label: 'Email', type: 'text' },
            // See query-builder for why 'id' column has type 'text'
            { name: 'id', label: 'ID', type: 'text' },
            { name: 'created_at', label: 'Created At', type: 'date' },
            // Filter with a non database mapped column.
            // See also app/controllers/admin/users_controller.rb.
            {
              name: 'confirmed?', label: 'Confirmed?', type: 'select',
              options: [
                { label: 'True', value: true },
                { label: 'False', value: false }
              ]
            },
            // Another filter with a non database mapped column
            {
              name: 'role', label: 'Role', type: 'select',
              options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Moderator', value: 'moderator' }
              ]
            }
          ],
          initialColumns: ['email', 'id'],
          onSubmit: function () {
            $scope.dataTableInstance.ajax.reload();
          }
        };

        /**
         * Deletes a user.
         *
         * @param {number} userId - The user id to delete.
         */
        $scope.deleteUser = function (userId) {
          $scope.pleaseWaitSvc.request();
          // When performing an operation on a single row, unselect all rows
          // to avoid any ambiguity about the scope of the operation.
          $scope.dataTableSelectedRows.length = 0;

          User.remove({ userId: userId }, null,
            function (response) {
              $scope.pleaseWaitSvc.release();
              flash.now.set('success', 'User deleted.');

              $scope.dataTableInstance.ajax.reload();
            }, function (failureResponse) {
              $scope.pleaseWaitSvc.release();
              flash.now.set('error',
                failureResponse.data.error || 'Error deleting user.');
            });
        };
      };

      /**
       * The 'new' action.
       * Builds an empty user for the form.
       */
      $scope.actionNew = function () {
        $scope.user = initialData;

        $scope.userRoleOptions = USER_ROLE_OPTIONS;
      };

      /**
       * The 'create' action.
       * If there are validation errors on the server side, then populates the
       * 'userErrors' scope variable with these errors.
       */
      $scope.actionCreate = function () {
        $scope.pleaseWaitSvc.request();

        $scope.user.$save(function (response) {
          $scope.pleaseWaitSvc.release();
          flash.set('success', 'User created.');

          $location.path('users');
        }, function (failureResponse) {
          $scope.pleaseWaitSvc.release();
          $scope.userErrors = failureResponse.data.errors;
        });
      };

      /**
       * The 'edit' action.
       */
      $scope.actionEdit = function () {
        $scope.user = initialData;

        $scope.userRoleOptions = USER_ROLE_OPTIONS;
      };

      /**
       * The 'update' action.
       * If there are validation errors on the server side, then populates the
       * 'userErrors' scope variable with these errors.
       */
      $scope.actionUpdate = function () {
        $scope.pleaseWaitSvc.request();

        $scope.user.$update(function (response) {
          $scope.pleaseWaitSvc.release();
          flash.set('success', 'User updated.');

          $location.path('users');
        }, function (failureResponse) {
          $scope.pleaseWaitSvc.release();
          $scope.userErrors = failureResponse.data.errors;
        });
      };
    }]);
