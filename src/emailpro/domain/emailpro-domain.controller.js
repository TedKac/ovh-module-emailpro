angular.module("Module.emailpro.controllers").controller("EmailProTabDomainsCtrl", ($scope, $http, $stateParams, EmailPro, EmailProDomains) => {
    "use strict";

    $scope.domainTypeAuthoritative = "AUTHORITATIVE";
    $scope.domainTypeNonAuthoritative = "NON_AUTHORITATIVE";
    $scope.stateCreating = EmailPro.stateCreating;
    $scope.stateDeleting = EmailPro.stateDeleting;
    $scope.stateOk = EmailPro.stateOk;

    var init = function () {
        $scope.loading = false;
        $scope.paginated = null;
        $scope.search = { value: null };

        EmailPro.getSelected().then((exchange) => {
            $scope.exchange = exchange;
            $scope.isUpdateDisabledClass = $scope.domain.state !== $scope.stateOk ||
                $scope.domain.taskInProgress || isReseller2010AuthInvalidMx(exchange) ? "disabled" : "";
            if ($scope.exchange.offer === "PROVIDER") {
                $scope.cnameRedirection = "ex-mail.biz";
            } else {
                $scope.cnameRedirection = "ovh.com";
            }
        });
    };

    function isReseller2010AuthInvalidMx (exchange) {
        return exchange.offer === "PROVIDER" &&
            exchange.serverDiagnostic.commercialVersion === "_2010" &&
            $scope.domain.type === "AUTHORITATIVE" &&
            !$scope.domain.mxValid;
    }

    $scope.updateDomain = function (domain) {
        if (domain.state === $scope.stateOk && !domain.taskInProgress && !isReseller2010AuthInvalidMx($scope.exchange)) {
            domain.domainTypes = $scope.domainTypes;
            $scope.setAction("emailpro/domain/update/emailpro-domain-update", angular.copy(domain));
        }
    };

    $scope.isDeleteDisabled = function (domain) {
        return domain.state !== $scope.stateOk || domain.accountsCount > 0 ? "disabled" : "";
    };

    $scope.getDeleteTooltip = function (domain) {
        return domain.state !== $scope.stateOk ||
            domain.accountsCount > 0 ? $scope.tr("emailpro_tab_domain_delete_domain_accounts_warning") : "";
    };

    $scope.deleteDomain = function (domain) {
        if (domain.state === $scope.stateOk && domain.accountsCount === 0) {
            $scope.setAction("emailpro/domain/remove/emailpro-domain-remove", domain);
        }
    };

    $scope.getDomains = function (count, offset) {
        $scope.loading = true;
        EmailProDomains.getDomains($stateParams.productId, count, offset, $scope.search.value)
            .then((domains) => {
                $scope.paginated = domains;
                $scope.domainTypes = domains.domainTypes;
                setTooltips($scope.paginated);
                $scope.loading = false;
            }, () => {
                $scope.loading = false;
            });
    };

    function setTooltips (paginated) {
        if (paginated && paginated.domains && paginated.domains.length) {
            angular.forEach($scope.paginated.domains, (domain) => {
                if ($scope.exchange) {
                    setMxTooltip(domain);
                    setSrvTooltip(domain);
                }
            });
        }
    }

    function setMxTooltip (domain) {
        if (domain.mxValid) {
            domain.mxTooltip = $scope.tr("exchange_tab_domain_diagnostic_mx_toolbox_ok");
        } else {
            domain.mxTooltip = $scope.tr("exchange_tab_domain_diagnostic_mx_toolbox", [$scope.exchange.hostname]);
        }
    }

    function setSrvTooltip (domain) {
        if (domain.srvValid) {
            domain.srvTooltip = $scope.tr("exchange_tab_domain_diagnostic_srv_toolbox_ok");
        } else {
            domain.srvTooltip = $scope.tr("exchange_tab_domain_diagnostic_srv_toolbox", [$scope.exchange.hostname]);
        }
    }

    $scope.$watch("search.value", (search) => {
        if ($scope.search) {
            if ($scope.search.value === search) {
                $scope.$broadcast("paginationServerSide.loadPage", 1, "domainsTable");
            }
        }
    });

    $scope.containPartial = function () {
        var i;
        if ($scope.paginated && $scope.paginated.domains && $scope.paginated.domains.length) {
            for (i = 0; i < $scope.paginated.domains.length; i++) {
                if ($scope.paginated.domains[i].partial) {
                    return true;
                }
            }
        }
        return false;
    };

    $scope.$on(EmailPro.events.domainsChanged, () => {
        $scope.$broadcast("paginationServerSide.reload", "domainsTable");
    });

    init();
});
