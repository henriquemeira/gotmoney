sap.ui.define([
    "sap/ui/core/ValueState",
    "sap/ui/core/format/DateFormat"
], function (ValueState, DateFormat) {
    "use strict";

    return {
        /**
         * Rounds the currency value to 2 digits
         *
         * @public
         * @param {string}
         *            sValue value to be formatted
         * @returns {string} formatted currency value with 2 digits
         */
        currencyValue: function (sValue) {
            if (!sValue) {
                return "";
            }

            return parseFloat(sValue).toFixed(2);
        },

        /**
         * Set calendar to show months from Jan to Dec
         *
         * @public
         * @returns {date} JavaScript Date Object
         */
        getCalendarStartDate: function () {
            var d = new Date();
            return new Date(d.getFullYear(), 0, 5);
        },

        balanceState: function (iValue) {
            return (iValue < 0) ? ValueState.Error : ValueState.Success;
        },

        creditDebit: function (sValue) {
            return (sValue === "D") ? ValueState.Error : ValueState.Success;
        },

        paymentIcon: function (sValue) {
            return ((sValue === "001" || sValue === true)) ? "sap-icon://accept" : "sap-icon://decline";
        },

        paymentStatus: function (sValue) {
            return ((sValue === "001" || sValue === true)) ? ValueState.Success : ValueState.Error;
        },

        paymentTooltip: function (sValue) {
            return ((sValue === "001" || sValue === true))
                ? this.getResourceBundle().getText('Transaction.status.paid')
                : this.getResourceBundle().getText('Transaction.status.awaiting');
        },

        accountTypeIcon: function (sId) {
            switch (sId) {
                // Cash
                case '001':
                    return "sap-icon://money-bills";
                // Credit Card
                case '002':
                    return "sap-icon://credit-card";
                // Bank Account
                case '003':
                    return "sap-icon://loan";
                // Savings
                case '004':
                    return "sap-icon://waiver";
                default:
                    return 'sap-icon://money-bills';
            }
        },

        accountTypeName: function (sId) {
            try {
                return this.getResourceBundle().getText('Account.Type.' + sId);
            } catch (e) {
                console.dir(e);
                return sId;
            }
        },

        accountName: function (sValue) {
            var sDesc = sValue;
            try {
                var oModel = this.getView().getModel();
                if (oModel) {
                    var nItems = oModel.getData().User.Account.length;
                    var aAccounts = oModel.getData().User.Account;
                    for (var i = 0; i < nItems; i++) {
                        if (aAccounts[i].idconta == sValue) {
                            sDesc = aAccounts[i].descricao;
                            return sDesc;
                        }
                    }
                }
            } catch (e) {
                console.dir(e);
            }
            return sDesc;
        },

        numeralBoolean: function (number) {
            return (number) ? true : false;
        },

        dateMySQLFormat: function (dateJS) {
            if (dateJS) {
                var oDateFormat = DateFormat.getDateTimeInstance({pattern: "yyyy-MM-dd"});
                return oDateFormat.format(new Date(dateJS));
            } else {
                return dateJS;
            }
        },

        convertIdStatusToBoolean: function (sIdStatus) {
            return (sIdStatus === "001" || sIdStatus === true) ? true : false;
        }
    };
});