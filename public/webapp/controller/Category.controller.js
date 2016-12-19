sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "com/mlauffer/gotmoneyappui5/controller/BaseController",
    "com/mlauffer/gotmoneyappui5/controller/Validator",
    "com/mlauffer/gotmoneyappui5/model/ObjectFactory"
], function (MessageBox, MessageToast, JSONModel, BaseController, Validator, ObjectFactory) {
    "use strict";

    return BaseController.extend("com.mlauffer.gotmoneyappui5.controller.Category", {
        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            this.getView().setModel(new JSONModel(), "category");

            try {
                var oRouter = this.getRouter();
                oRouter.getRoute("category").attachMatched(this._onRouteMatched, this);
                oRouter.getRoute("categoryNew").attachMatched(this._onRouteMatchedNew, this);

                this.getView().addEventDelegate({
                    onAfterShow: function () {
                        this.checkUserConnected(true);
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

        onSave: function (oEvent) {
            // Create new validator instance
            var oValidator = new Validator();

            // Validate input fields
            oValidator.validate(this.getView().byId("categoryForm"));
            if (!oValidator.isValid()) {
                return;
            }

            this.getView().setBusy(true);
            if (this.getView().getViewName() === "com.mlauffer.gotmoneyappui5.view.Category") {
                this._saveEdit(oEvent);
            } else {
                this._saveNew(oEvent);
            }
        },


        onDelete: function (oEvent) {
            var that = this;
            var sPath = oEvent.getSource().getBindingContext().getPath();
            MessageBox.confirm(that.getResourceBundle().getText("Delete.message"), function (sAction) {
                if (MessageBox.Action.OK === sAction) {
                    that.getView().setBusy(true);
                    var oModel = that.getView().getModel();

                    $.ajax({
                        url: "/category/" + oModel.getData().User.Category[that.extractIdFromPath(sPath)].idcategoria,
                        contentType: 'application/json',
                        dataType: 'json',
                        method: 'DELETE'
                    })
                    .done(jQuery.proxy(that._deleteDone(sPath), this))
                    .fail(jQuery.proxy(that._ajaxFail, this));
                }
            }, that.getResourceBundle().getText("Delete.title"));
        },


        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        _onRouteMatched: function (oEvent) {
            var sObjectPath = "/User/Category/" + oEvent.getParameter("arguments").categoryId;
            this._bindView(sObjectPath);
        },


        _onRouteMatchedNew: function () {
            this.getView().getModel("category").setData(ObjectFactory.buildCategory());
            //this.getView().getModel("category").refresh(true);
        },


        _bindView: function (sPath) {
            var oView = this.getView();
            oView.unbindElement();
            oView.bindElement({
                path: sPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function (oEvent) {
                        console.log("dataRequested");
                        oView.setBusy(true);
                    },
                    dataReceived: function (oEvent) {
                        console.log("dataReceived");
                        oView.setBusy(false);
                    }
                }
            });
        },


        _onBindingChange: function () {
            // No data for the binding
            if (!this.getView().getBindingContext()) {
                this.getRouter().getTargets().display("notFound");
            }
        },


        _saveNew: function () {
            //TODO: Validation
            var that = this;
            var mPayload = this._getPayload();
            mPayload.idcategoria = $.now();

            $.ajax({
                url: "/category",
                contentType: 'application/json',
                data: JSON.stringify(mPayload),
                dataType: 'json',
                method: 'POST'
            })
            .done(jQuery.proxy(that._newDone(mPayload), this))
            .fail(jQuery.proxy(that._ajaxFail, this));
        },


        _saveEdit: function (oEvent) {
            //TODO: Validation
            var that = this;
            var oContext = oEvent.getSource().getBindingContext();
            var oModel = this.getView().getModel();
            var mPayload = this._getPayload();
            mPayload.idcategoria = oModel.getProperty("idcategoria", oContext);

            $.ajax({
                url: "/category/" + mPayload.idcategoria,
                contentType: 'application/json',
                data: JSON.stringify(mPayload),
                dataType: 'json',
                method: 'PUT'
            })
            .done(jQuery.proxy(that._editDone(mPayload, oContext), this))
            .fail(jQuery.proxy(that._ajaxFail, this));
        },


        _newDone: function (mPayload) {
            try {
                this.getView().getModel().getData().User.Category.push(mPayload);
                this.onFinishBackendOperation();
                MessageToast.show(this.getResourceBundle().getText("Success.save"));

            } catch (e) {
                this.saveLog('E', e.message);
                MessageBox.error(e.message);
            }
        },


        _editDone: function (mPayload, oContext) {
            try {
                this.getView().getModel().setProperty("descricao", mPayload.descricao, oContext);
                this.onFinishBackendOperation();
                MessageToast.show(this.getResourceBundle().getText("Success.save"));

            } catch (e) {
                this.saveLog('E', e.message);
                MessageBox.error(e.message);
            }
        },


        _deleteDone: function (sPath) {
            try {
                this.getView().getModel().getData().User.Category.splice(this.extractIdFromPath(sPath), 1);
                this.onFinishBackendOperation();
                MessageToast.show(this.getResourceBundle().getText("Success.delete"));

            } catch (e) {
                this.saveLog('E', e.message);
                MessageBox.error(e.message);
            }
        },


        _getPayload: function () {
            var oView = this.getView();
            var mPayload = ObjectFactory.buildCategory();

            mPayload.descricao = oView.byId("description").getValue();

            return mPayload;
        }
    });
});
