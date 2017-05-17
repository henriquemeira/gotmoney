sap.ui.define([
  'jquery.sap.global',
  'sap/ui/core/util/MockServer'
], function(jQuery, MockServer) {
  'use strict';

  var oMockServer;
  var _sAppModulePath = 'fiori/md/';

  return {
    /**
     * Initializes the mock server.
     * You can configure the delay with the URL parameter "serverDelay".
     * The local mock data in this folder is returned instead of the real data for testing.
     * @public
     */

    init: function() {
      var oUriParameters = jQuery.sap.getUriParameters();
      var sErrorParam = oUriParameters.get('errorType');
      var iErrorCode = sErrorParam === 'badRequest' ? 400 : 500;
      var oMockServer = new MockServer({
        rootUri: '/'
      });
      MockServer.config({
        autoRespond: true,
        autoRespondAfter: oUriParameters.get('serverDelay') || 1000
      });
      var sPath = jQuery.sap.getModulePath('com.mlauffer.gotmoneyappui5.localService');
      //oMockServer.simulate(sPath + '/metadata.xml', sPath + '/mockdata', true);

      var oModel = sap.ui.model.json.JSONModel(sPath + '/mockdata/mock.json');
      console.dir(oModel);
      console.dir(oModel.getData());
      console.dir(oModel.getJSON());

      oModel.loadData(sPath + '/mockdata/mock.json', false);
      console.dir(oModel);
      console.dir(oModel.getData());
      console.dir(oModel.getJSON());

      // handling mocking a function import call step
      var aRequests = oMockServer.getRequests();
      aRequests.push({
        method: 'GET',
        path: new RegExp('api/session/loggedin(.*)'),
        response: function(oXhr, sUrlParams) {
          jQuery.sap.log.debug('Incoming request for /session/loggedin');
          console.log('Incoming request for /session/loggedin');
          oXhr.respondJSON(200, {'Content-Type': 'application/json'}, JSON.stringify({}));
          return true;
        }
      });
      aRequests.push({
        method: 'GET',
        path: new RegExp('api/user(.*)'),
        response: function(oXhr, sUrlParams) {
          jQuery.sap.log.debug('Incoming request for /user');
          console.log('Incoming request for /user');
          oXhr.respondJSON(200, {'Content-Type': 'application/json'}, oModel.getJSON());
          return true;
        }
      });
      aRequests.push({
        method: 'GET',
        path: new RegExp('api/transaction(.*)'),
        response: function(oXhr, sUrlParams) {
          jQuery.sap.log.debug('Incoming request for /user');
          console.log('Incoming request for /user');
          oXhr.respondJSON(200, {'Content-Type': 'application/json'}, []);
          return true;
        }
      });
      oMockServer.setRequests(aRequests);

      oMockServer.start();
      jQuery.sap.log.info('Incoming request for FindUpcomingMeetups');
      console.log('Running the app with mock data');
      console.dir(oMockServer);
      console.dir(oMockServer.getMetadata());
      console.dir(oMockServer.getRequests());
    },

    /**
     * @public returns the mockserver of the app, should be used in integration tests
     * @returns {sap.ui.core.util.MockServer} the mockserver instance
     */
    getMockServer: function() {
      return oMockServer;
    }
  };
});
