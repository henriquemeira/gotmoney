sap.ui.define([
  'sap/ui/core/UIComponent',
  'sap/ui/Device',
  'sap/ui/model/BindingMode',
  'sap/ui/model/json/JSONModel',
  'com/mlauffer/gotmoneyappui5/model/models'
], function(UIComponent, Device, BindingMode, JSONModel, Models) {
  'use strict';

  return UIComponent.extend('com.mlauffer.gotmoneyappui5.Component', {
    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
     * @public
     * @override
     */
    init: function() {
      // call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);

      this.setResourceBundle();
      this.setModels();
      this.setAjaxSetup();
      this.getRouter().initialize();
    },


    /**
     * The component is destroyed by UI5 automatically.
     * @public
     * @override
     */
    destroy: function() {
      // call the base component's destroy function
      this._resourceBundle.destroy();
      UIComponent.prototype.destroy.apply(this, arguments);
    },


    setModels: function() {
      Models.editDefaultModel(this.getModel());
      this.setModel(Models.createDeviceModel(), 'device');
    },

    setAjaxSetup: function() {
      $.ajaxSetup({
        contentType: 'application/json',
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        }
      });
    },

    setResourceBundle: function() {
      var that = this;
      this._resourceBundle = {};
      this.getModel('i18n').getResourceBundle()
        .then(function(res) {
          that._resourceBundle = res;
        })
        .catch(function(err) {
          console.dir(err);
        });
    },

    getResourceBundleSync: function() {
      return this._resourceBundle;
    }
  });
});
