sap.ui.define([
  'jquery.sap.global',
  'sap/m/MessageBox',
  'sap/m/MessageToast',
  'sap/ui/model/json/JSONModel',
  'sap/ui/core/ValueState',
  'com/mlauffer/gotmoneyappui5/controller/BaseController',
  'com/mlauffer/gotmoneyappui5/controller/Validator',
  'com/mlauffer/gotmoneyappui5/controller/ZString',
  'com/mlauffer/gotmoneyappui5/model/ObjectFactory',
  'com/mlauffer/gotmoneyappui5/model/formatter'
], function(jQuery, MessageBox, MessageToast, JSONModel, ValueState, BaseController, Validator, ZString, ObjectFactory,
            formatter) {
  'use strict';

  return BaseController.extend('com.mlauffer.gotmoneyappui5.controller.User', {
    formatter: formatter,
    ZString: ZString,

    onInit: function() {
      try {
        this.getView().setModel(new JSONModel(), 'user');
        var oRouter = this.getRouter();
        oRouter.getRoute('profile').attachMatched(this._onRouteMatched, this);
        oRouter.getRoute('signup').attachMatched(this._onRouteMatchedNew, this);

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
      var oView = this.getView();
      // Create new validator instance
      var oValidator = new Validator();

      // Validate input fields
      oValidator.validate(oView.byId('form'));
      if (!oValidator.isValid()) {
        return;
      }

      if (oView.byId('pwd').getValue()) {
        if (oView.byId('pwd').getValue() === oView.byId('pwdRepeat').getValue()) {
          oView.byId('pwd').setValueState(ValueState.None);
          oView.byId('pwdRepeat').setValueState(ValueState.None);
        } else {
          oView.byId('pwd').setValueState(ValueState.Error);
          oView.byId('pwdRepeat').setValueState(ValueState.Error);
          MessageToast.show(this.getResourceBundle().getText('Error.passwordNotEqual'));
          return;
        }
      }

      this.getView().setBusyIndicatorDelay(0);
      this.getView().setBusy(true);
      //oEvent.getSource().getEnabled(false);
      if (this.getView().getViewName() === 'com.mlauffer.gotmoneyappui5.view.User') {
        this._saveEdit(oEvent.getSource().getBindingContext());
      }
      //oEvent.getSource().getEnabled(true);
    },


    _onRouteMatched: function() {
      var sObjectPath = '/User/';
      this._bindView(sObjectPath);
    },


    _onRouteMatchedNew: function() {
      this.getView().getModel('user').setData(ObjectFactory.buildUser());
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


    _saveEdit: function(oContext) {
      var that = this;
      var mPayload = this._getPayload();
      that.getView().byId('btSave').setBusy(true);
      mPayload.iduser = oContext.getProperty('iduser');
      if (!mPayload.passwd) {
        delete mPayload.passwd;
      }

      jQuery.ajax({
        url: '/api/user/' + mPayload.iduser,
        data: JSON.stringify(mPayload),
        method: 'PUT'
      })
        .done(function() {
          that._editDone(mPayload, oContext);
        })
        .fail(jQuery.proxy(that._ajaxFail, this))
        .always(function() {
          that.getView().byId('btSave').setBusy(false);
        })
      ;
    },


    _editDone: function(mPayload, oContext) {
      try {
        var oModel = this.getView().getModel();
        oModel.setProperty('name', mPayload.name, oContext);
        oModel.setProperty('gender', mPayload.gender, oContext);
        oModel.setProperty('birthdate', mPayload.birthdate, oContext);
        oModel.setProperty('alert', mPayload.alert, oContext);
        this.onFinishBackendOperation();
        MessageToast.show(this.getResourceBundle().getText('Success.save'));

      } catch (e) {
        this.saveLog('E', e.message);
        MessageBox.error(e.message);
      }
    },


    _getPayload: function() {
      var oView = this.getView();
      var mPayload = ObjectFactory.buildUser();
      //iduser : null,
      mPayload.email = oView.byId('email').getValue();
      mPayload.passwd = oView.byId('pwd').getValue();
      mPayload.name = oView.byId('name').getValue();
      mPayload.gender = oView.byId('sex').getSelectedKey();
      mPayload.birthdate = oView.byId('birthdate').getDateValue();
      mPayload.alert = oView.byId('alert').getState();
      mPayload.lastchange = jQuery.now();
      //mPayload.lastsync : null
      if (mPayload.birthdate) {
        mPayload.birthdate.setHours(12); //Workaround for date location, avoid D -1
      }
      return mPayload;
    }
  });
});
