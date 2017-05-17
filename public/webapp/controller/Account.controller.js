sap.ui.define([
  'jquery.sap.global',
  'sap/m/MessageBox',
  'sap/m/MessageToast',
  'sap/ui/model/json/JSONModel',
  'com/mlauffer/gotmoneyappui5/controller/BaseController',
  'com/mlauffer/gotmoneyappui5/controller/Validator',
  'com/mlauffer/gotmoneyappui5/model/formatter',
  'com/mlauffer/gotmoneyappui5/model/ObjectFactory'
], function(jQuery, MessageBox, MessageToast, JSONModel, BaseController, Validator, formatter, ObjectFactory) {
  'use strict';

  return BaseController.extend('com.mlauffer.gotmoneyappui5.controller.Account', {
    formatter: formatter,

    onInit: function() {
      try {
        this.getView().setModel(new JSONModel(), 'account');
        var oRouter = this.getRouter();
        oRouter.getRoute('account').attachMatched(this._onRouteMatched, this);
        oRouter.getRoute('accountNew').attachMatched(this._onRouteMatchedNew, this);

        this.getView().addEventDelegate({
          onAfterShow: function() {
            this.checkSession();
          }
        }, this);

      } catch (e) {
        this.saveLog('E', e.message);
        MessageBox.error(e.message);
      }
    },

    onSave: function(oEvent) {
      this.vibrate();
      // Create new validator instance
      var oValidator = new Validator();
      // Validate input fields
      oValidator.validate(this.getView().byId('form'));
      if (!oValidator.isValid()) {
        return;
      }

      this.getView().setBusy(true);
      if (this.getView().getViewName() === 'com.mlauffer.gotmoneyappui5.view.Account') {
        this._saveEdit(oEvent.getSource().getBindingContext());
      } else {
        this._saveNew(oEvent);
      }
    },


    onDelete: function(oEvent) {
      this.vibrate();
      var that = this;
      var oContext = oEvent.getSource().getBindingContext();
      MessageBox.confirm(that.getResourceBundle().getText('Delete.message'), function(sAction) {
        if (MessageBox.Action.OK === sAction) {
          that._delete(oContext);
        }
      }, that.getResourceBundle().getText('Delete.title'));
    },


    onChangeType: function() {
      this._setInvoicedayVisibility();
    },

    _onRouteMatched: function(oEvent) {
      var sObjectPath = '/User/Account/' + oEvent.getParameter('arguments').accountId;
      this._bindView(sObjectPath);
      this._setInvoicedayVisibility();
    },


    _onRouteMatchedNew: function() {
      this.getView().getModel('account').setData(ObjectFactory.buildAccount());
      //this.getView().getModel("account").refresh(true);
      this._setInvoicedayVisibility();
    },


    _bindView: function(sPath) {
      var oView = this.getView();
      oView.unbindElement();
      oView.bindElement({
        path: sPath,
        events: {
          change: this._onBindingChange.bind(this),
          dataRequested: function(oEvent) {
            oView.setBusy(true);
          },
          dataReceived: function(oEvent) {
            oView.setBusy(false);
          }
        }
      });
    },


    _onBindingChange: function() {
      // No data for the binding
      if (!this.getView().getBindingContext()) {
        this.getRouter().getTargets().display('notFound');
      }
    },


    _saveNew: function() {
      var that = this;
      var mPayload = this._getPayload();
      mPayload.idaccount = jQuery.now();

      jQuery.ajax({
        url: '/api/account',
        data: JSON.stringify(mPayload),
        method: 'POST'
      })
        .done(function() {
          that._newDone(mPayload);
        })
        .fail(jQuery.proxy(that._ajaxFail, this));
    },


    _saveEdit: function(oContext) {
      var that = this;
      var mPayload = this._getPayload();
      mPayload.idaccount = oContext.getProperty('idaccount');

      jQuery.ajax({
        url: '/api/account/' + mPayload.idaccount,
        data: JSON.stringify(mPayload),
        method: 'PUT'
      })
        .done(function() {
          that._editDone(mPayload, oContext);
        })
        .fail(jQuery.proxy(that._ajaxFail, this));
    },


    _delete: function(oContext) {
      this.getView().setBusy(true);
      var that = this;
      jQuery.ajax({
        url: '/api/account/' + oContext.getProperty('idaccount'),
        method: 'DELETE'
      })
        .done(function() {
          that._deleteDone(oContext);
        })
        .fail(jQuery.proxy(this._ajaxFail, this));
    },


    _newDone: function(mPayload) {
      try {
        this.getView().getModel().getData().User.Account.push(mPayload);
        this.onFinishBackendOperation();
        this.getView().setBusy(false);
        MessageToast.show(this.getResourceBundle().getText('Success.save'));

      } catch (e) {
        this.saveLog('E', e.message);
        MessageBox.error(e.message);
      }
    },


    _editDone: function(mPayload, oContext) {
      try {
        var oModel = this.getView().getModel();
        oModel.setProperty('idtype', mPayload.idtype, oContext);
        oModel.setProperty('description', mPayload.description, oContext);
        //TODO: mPayload.balance = 1;
        oModel.setProperty('openingdate', mPayload.openingdate, oContext);
        oModel.setProperty('creditlimit', mPayload.creditlimit, oContext);
        oModel.setProperty('duedate', mPayload.duedate, oContext);
        this.onFinishBackendOperation();
        MessageToast.show(this.getResourceBundle().getText('Success.save'));

      } catch (e) {
        this.saveLog('E', e.message);
        MessageBox.error(e.message);
      }
    },


    _deleteDone: function(oContext) {
      try {
        this.getView().getModel().getData().User.Account.splice(this.extractIdFromPath(oContext.getPath()), 1);
        this.onFinishBackendOperation();
        MessageToast.show(this.getResourceBundle().getText('Success.delete'));

      } catch (e) {
        this.saveLog('E', e.message);
        MessageBox.error(e.message);
      }
    },


    _getPayload: function() {
      var oView = this.getView();
      var mPayload = ObjectFactory.buildAccount();
      mPayload.idtype = parseInt(oView.byId('idtype').getSelectedKey(), 10);
      mPayload.description = oView.byId('description').getValue();
      mPayload.creditlimit = parseFloat(oView.byId('creditlimit').getValue());
      mPayload.balance = 0;
      mPayload.openingdate = oView.byId('opendate').getDateValue();
      mPayload.duedate = parseInt(oView.byId('invoiceday').getValue(), 10);
      mPayload.lastchange = jQuery.now();
      if (mPayload.openingdate) {
        mPayload.openingdate.setHours(12); //Workaround for date location, avoid D -1
      }
      if (!jQuery.isNumeric(mPayload.duedate) || mPayload.duedate === 0) {
        mPayload.duedate = null;
      }
      return mPayload;
    },


    _setInvoicedayVisibility: function() {
      var bShow = (this.getView().byId('idtype').getSelectedKey() === '2');
      this.getView().byId('invoiceday').setVisible(bShow);
      this.getView().byId('invoicedayLabel').setVisible(bShow);
    }
  });
});
