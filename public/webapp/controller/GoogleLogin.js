sap.ui.define([
    "sap/m/MessageBox",
    "sap/ui/core/mvc/Controller"
], function (MessageBox, Controller) {
    "use strict";

    return Controller.extend("com.mlauffer.gotmoneyappui5.controller.GoogleLogin", {
        _oViewController: null,

        /**
         * The component is destroyed by UI5 automatically.
         * @public
         * @override
         */
        destroy: function () {
            if (this._oViewController !== null) {
                this._oViewController.destroy();
            }
        },

        renderButton: function (oViewController, idButton) {
            this._oViewController = oViewController;

            /*gapi.signin2.render('Login--btGoogle', {
             'scope': 'profile email',
             'width': 240,
             'height': 40,
             'longtitle': true,
             'theme': 'dark',
             'onsuccess': jQuery.proxy(this.onSuccess, this),
             'onfailure': jQuery.proxy(this.onFailure, this)
             });*/

            if (Google.auth2) {
                Google.auth2.attachClickHandler(idButton, {},
                    jQuery.proxy(this.onSuccess, this),
                    jQuery.proxy(this.onFailure, this)
                );
            } else {
                //this.onFailure();
            }
        },

        onSuccess: function (googleUser) {
            if (this._oViewController._oDialogLogin) {
                this._oViewController._oDialogLogin.setBusy(true);
            }
            this._oViewController.getView().setBusy(true);
            var that = this;
            var mPayload = {
                login: "google",
                iduser: googleUser.getBasicProfile().getId(),
                nome: googleUser.getBasicProfile().getName(),
                email: googleUser.getBasicProfile().getEmail(),
                token: googleUser.getAuthResponse().access_token
            };

            $.ajax({
                url: "/session/",
                contentType: 'application/json',
                data: JSON.stringify(mPayload),
                dataType: 'json',
                method: 'POST'
            })
            .done(function (response, textStatus, jqXHR) {
                that._oViewController._loginDone();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                if (that._oViewController._oDialogLogin) {
                    that._oViewController._oDialogLogin.setBusy(false);
                }
                that._oViewController._ajaxFail(jqXHR, textStatus, errorThrown);
            });
        },


        onFailure: function () {
            if (this._oViewController._oDialogLogin) {
                this._oViewController._oDialogLogin.setBusy(false);
            }
            this._oViewController.getView().setBusy(false);
            MessageBox.error(this._oViewController.getResourceBundle().getText("Login.googleError"));
        }
    });
});
