/* eslint-disable no-undef */
angular
    .module("Module.emailpro.controllers")
    .controller("EmailProDomainSrvAutoconfigCtrl", class EmailProDomainSrvAutoconfigCtrl {
        constructor ($scope, $stateParams, EmailPro, EmailProDomains) {
            this.services = { $scope, $stateParams, EmailPro, EmailProDomains };

            this.loading = {
                step1: false
            };

            this.domain = $scope.currentActionData;
            $scope.configSRV = () => this.configSRV();
            $scope.getIsOVHDomain = () => this.isOVHDomain;

            this.init();
        }

        init () {
            this.loading.step1 = true;

            this.services
                .EmailProDomains
                .getDnsSettings(this.services.$stateParams.productId, this.domain.name)
                .then(
                    (data) => { this.domainDiag = data; },
                    (failure) => {
                        this.services.$scope.resetAction();
                        this.services.$scope.setMessage($scope.tr("exchange_tab_domain_diagnostic_add_field_failure"), failure);
                    })
                .finally(() => {
                    this.loading.step1 = false;
                });
        }

        prepareModel () {
            return {
                domain: this.domain.name,
                fieldList: [this.domainDiag.srv]
            };
        }

        configSRV () {
            this.services.$scope.resetAction();

            this.services
                .EmailProDomains
                .addZoneDnsField(this.services.$stateParams.productId, this.prepareModel())
                .then((success) => {
                    if (success.state === "OK") {
                        this.services.$scope.setMessage($scope.tr("exchange_tab_domain_diagnostic_add_field_success"), { status: "success" });
                    } else {
                        this.services.$scope.setMessage($scope.tr("exchange_tab_domain_diagnostic_add_field_failure"), { status: "error" });
                    }
                }, (failure) => this.services.$scope.setMessage(this.services.$scope.tr("exchange_tab_domain_diagnostic_add_field_failure"), failure));
        }
    });
/* eslint-enable no-undef */
