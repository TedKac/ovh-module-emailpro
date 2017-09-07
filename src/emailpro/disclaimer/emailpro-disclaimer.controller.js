angular.module("Module.emailpro.controllers")
    .controller("EmailProDisclaimerCtrl", ($scope, $stateParams, EmailPro) => {
        "use strict";

        function hasEmptySlot (list) {
            var result = false;
            angular.forEach(list,
                            (value) => {
                                if (value.emptySlotFlag) {
                                    result = true;
                                }
                            });
            return result;
        }
        function hasFullSlot (list) {
            var result = false;
            angular.forEach(list,
                            (value) => {
                                if (!value.emptySlotFlag) {
                                    result = true;
                                }
                            });
            return result;
        }

        $scope.disclaimersList = null;
        $scope.loading = true;
        $scope.tableLoading = false;

        $scope.loadPaginated = function (count, offset) {
            $scope.tableLoading = true;
            EmailPro.getDisclaimers($stateParams.productId, count, offset)
                .then((disclaimers) => {
                    $scope.tableLoading = false;
                    $scope.disclaimersList = disclaimers;
                    $scope.setMessagesFlags(disclaimers);

                }, (data) => {
                    $scope.tableLoading = false;
                    $scope.setMessage($scope.tr("exchange_tab_DISCLAIMER_error_message"), data.data);
                });
        };

        $scope.setMessagesFlags = function (disclaimersList) {
            $scope.addDomainMessageFlag = false;
            $scope.noDisclaimerMessageFlag = false;

            if (disclaimersList.list.results.length === 0 ||
            (!hasEmptySlot(disclaimersList.list.results) && !hasFullSlot(disclaimersList.list.results))) {
                $scope.addDomainMessageFlag = true;
            } else if (hasEmptySlot(disclaimersList.list.results) && !hasFullSlot(disclaimersList.list.results)) {
                $scope.noDisclaimerMessageFlag = true;
            }
        };

        $scope.$on(EmailPro.events.disclaimersChanged, () => {
            $scope.$broadcast("paginationServerSide.reload", "disclaimersTable");
        });

        $scope.newDisclaimersDisabled = function () {
            var result = false;
            if ($scope.disclaimersList) {
                result = hasEmptySlot($scope.disclaimersList.list.results);
            }
            return !result;
        };

        $scope.addDisclaimer = function () {
            if (!$scope.newDisclaimersDisabled()) {
                $scope.setAction("emailpro/disclaimer/add/emailpro-disclaimer-add");
            }
        };

        $scope.$on(EmailPro.events.disclaimersChanged, () => {
            $scope.$broadcast("paginationServerSide.reload", "disclaimersTable");
        });
    });

angular.module("Module.emailpro.controllers")
    .controller("EmailProAddDisclaimerCtrl", ($scope, $stateParams, EmailPro) => {
        "use strict";
        var mceId = "add-disclaimer-editor";

        $scope.data = {
            content: "",
            outsideOnly: false,
            selectedVariable: "Name"
        };

        $scope.insertVariable = function () {
            CKEDITOR.instances[mceId].insertText(`%%${$scope.data.selectedAttribute}%%`);
        };

        $scope.loadAvailableDomains = function () {
            $scope.loadingData = true;

            return EmailPro.getNewDisclaimerOptions($stateParams.productId).then((data) => {
                $scope.loadingData = false;
                if (data.availableDomains) {
                    $scope.data.completeDomain = data.availableDomains[0];
                    $scope.availableDomains = data.availableDomains;

                    $scope.data.selectedAttribute = data.availableAttributes[0];
                    $scope.availableAttributes = data.availableAttributes;
                } else {
                    $scope.resetAction();
                    $scope.setMessage($scope.tr("exchange_ACTION_add_disclaimer_no_domains"));
                }
                return $scope.data;
            });
        };
        $scope.loadAvailableDomains();

        $scope.saveDisclaimer = function () {
            var model = {
                domain: $scope.data.completeDomain.name,
                externalEmailsOnly: $scope.data.outsideOnly,
                content: $scope.data.content
            };

            $scope.setMessage($scope.tr("exchange_dashboard_action_doing"));
            EmailPro.saveDisclaimer($stateParams.productId, model).then((data) => {
                $scope.setMessage($scope.tr("exchange_ACTION_add_disclaimer_success_message"), data);
            }, (failure) => {
                $scope.setMessage($scope.tr("exchange_ACTION_add_disclaimer_error_message"), failure.data);
            });
            $scope.resetAction();
        };
    });

angular.module("Module.emailpro.controllers")
    .controller("EmailProUpdateDisclaimerCtrl", ($scope, $stateParams, EmailPro) => {
        "use strict";
        var mceId = "update-disclaimer-editor";

        function loadOptions () {
            $scope.loadingData = true;
            return EmailPro.getUpdateDisclaimerOptions().then((data) => {
                $scope.availableAttributes = data.availableAttributes;
                if (data.availableAttributes) {
                    $scope.data.selectedAttribute = data.availableAttributes[0];
                }
                return $scope.data;
            }).then((data) => {
                $scope.loadingData = false;
                return data;
            });
        }

        $scope.data = angular.copy($scope.currentActionData);

        loadOptions();

        $scope.getCompleteDomain = function (domainName) {
            var result;
            angular.forEach($scope.availableDomains, (value) => {
                if (value.name === domainName) {
                    result = value;
                }
            });
            return result;
        };

        /**
     * Insert attributes at text field current cursor position
     */
        $scope.insertAttribute = function () {
            CKEDITOR.instances[mceId].insertText(`%%${$scope.data.selectedAttribute}%%`);
        };

        $scope.saveDisclaimer = function () {
            var model = {
                domain: $scope.data.domain.name,
                externalEmailsOnly: $scope.data.outsideOnly,
                content: $scope.data.content
            };

            $scope.setMessage($scope.tr("exchange_dashboard_action_doing"));
            EmailPro.updateDisclaimer($stateParams.productId, model).then((data) => {
                $scope.setMessage($scope.tr("exchange_ACTION_update_disclaimer_success_message"), data);
            }, (failure) => {
                $scope.setMessage($scope.tr("exchange_ACTION_update_disclaimer_error_message"), failure.data);
            });
            $scope.resetAction();
        };
    });

/**
 *
 */
angular.module("Module.emailpro.controllers")
    .controller("EmailProRemoveDisclaimerCtrl", ($scope, $stateParams, EmailPro) => {
        "use strict";

        $scope.disclaimer = $scope.currentActionData;
        $scope.submit = function () {
            $scope.setMessage($scope.tr("exchange_dashboard_action_doing"));
            EmailPro.deleteDisclaimer($stateParams.productId, $scope.disclaimer.domain.name)
                .then((success) => {
                    $scope.setMessage($scope.tr("exchange_ACTION_delete_disclaimer_success"), success);
                }, (failure) => {
                    $scope.setMessage($scope.tr("exchange_ACTION_delete_disclaimer_failure"), failure.data);
                });
            $scope.resetAction();
        };
    });
