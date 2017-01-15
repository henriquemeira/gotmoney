sap.ui.define([
    "sap/m/MessageBox",
    "com/mlauffer/gotmoneyappui5/controller/BaseController"
], function (MessageBox, BaseController) {
    "use strict";

    return BaseController.extend("com.mlauffer.gotmoneyappui5.controller.CategoryList", {
        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */
        onInit: function () {
            try {
                this.getView().addEventDelegate({
                    onAfterShow: function () {
                        this.checkSession();
                    }
                }, this);

            } catch (e) {
                this.saveLog('E', e.message);
                MessageBox.error(e.message);
            }
        },


        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */
        onItemPress: function (oEvent) {
            this.vibrate();
            this.getRouter().navTo("category", {
                categoryId: this.extractIdFromPath(oEvent.getSource().getBindingContext().getPath())
            });
        },


        onAddNew: function () {
            this.vibrate();
            this.getRouter().navTo("categoryNew");
        }

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */
    });
});
