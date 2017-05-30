sap.ui.define([
  'jquery.sap.global',
  'sap/m/MessageBox',
  'sap/m/MessageToast',
  'sap/ui/model/json/JSONModel',
  'com/mlauffer/gotmoneyappui5/controller/BaseController',
  'com/mlauffer/gotmoneyappui5/controller/Validator',
  'com/mlauffer/gotmoneyappui5/model/ObjectFactory'
], function(jQuery, MessageBox, MessageToast, JSONModel, BaseController, Validator, ObjectFactory) {
  'use strict';

  return BaseController.extend('com.mlauffer.gotmoneyappui5.controller.Category', {
    onInit: function() {
      try {
        this.getView().setModel(new JSONModel(), 'category');
        var oRouter = this.getRouter();
        oRouter.getRoute('category').attachMatched(this._onRouteMatched, this);
        oRouter.getRoute('categoryNew').attachMatched(this._onRouteMatchedNew, this);

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
      if (this.getView().getViewName() === 'com.mlauffer.gotmoneyappui5.view.Category') {
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


    _onRouteMatched: function(oEvent) {
      var sObjectPath = '/User/Category/' + oEvent.getParameter('arguments').categoryId;
      this._bindView(sObjectPath);
    },


    _onRouteMatchedNew: function() {
      this.getView().getModel('category').setData(ObjectFactory.buildCategory());
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
      //TODO: Validation
      var that = this;
      var mPayload = this._getPayload();
      mPayload.idcategory = jQuery.now();

      jQuery.ajax({
        url: '/api/category',
        data: JSON.stringify(mPayload),
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        }
      })
        .done(function() {
          that._newDone(mPayload);
        })
        .fail(jQuery.proxy(that._ajaxFail, this));
    },


    _saveEdit: function(oContext) {
      //TODO: Validation
      var that = this;
      var mPayload = this._getPayload();
      mPayload.idcategory = oContext.getProperty('idcategory');

      jQuery.ajax({
        url: '/api/category/' + mPayload.idcategory,
        data: JSON.stringify(mPayload),
        method: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        }
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
        url: '/api/category/' + oContext.getProperty('idcategory'),
        method: 'DELETE',
        contentType: 'application/json',
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        }
      })
        .done(function() {
          that._deleteDone(oContext);
        })
        .fail(jQuery.proxy(this._ajaxFail, this));
    },


    _newDone: function(mPayload) {
      try {
        this.getView().getModel().getData().User.Category.push(mPayload);
        this.onFinishBackendOperation();
        MessageToast.show(this.getResourceBundle().getText('Success.save'));

      } catch (e) {
        this.saveLog('E', e.message);
        MessageBox.error(e.message);
      }
    },


    _editDone: function(mPayload, oContext) {
      try {
        this.getView().getModel().setProperty('description', mPayload.description, oContext);
        this.onFinishBackendOperation();
        MessageToast.show(this.getResourceBundle().getText('Success.save'));

      } catch (e) {
        this.saveLog('E', e.message);
        MessageBox.error(e.message);
      }
    },


    _deleteDone: function(oContext) {
      try {
        this.getView().getModel().getData().User.Category.splice(this.extractIdFromPath(oContext.getPath()), 1);
        this.onFinishBackendOperation();
        MessageToast.show(this.getResourceBundle().getText('Success.delete'));

      } catch (e) {
        this.saveLog('E', e.message);
        MessageBox.error(e.message);
      }
    },


    _getPayload: function() {
      var oView = this.getView();
      var mPayload = ObjectFactory.buildCategory();
      mPayload.description = oView.byId('description').getValue();
      return mPayload;
    }
  });
});
