sap.ui.define([
    "sap/m/MessageBox",
    "sap/ui/core/mvc/Controller"
], function (MessageBox, Controller) {
    "use strict";

    return Controller.extend("com.mlauffer.gotmoneyappui5.controller.FacebookLogin", {
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


        login: function (oViewController) {
            this._oViewController = oViewController;
            var that = this;

            try {
                FB.login(function (responseLogin) {
                    if (responseLogin.status === 'connected') {
                        var graphAPIQuery = "/" + responseLogin.authResponse.userID + "?fields=email,name,gender";
                        FB.api(graphAPIQuery, function (responseApi) {
                            responseApi.accessToken = responseLogin.authResponse.accessToken;
                            that.onSuccess(responseApi);
                        });
                    } else {
                        that.onFailure();
                    }
                }, {
                    scope: 'public_profile,email'
                });

            } catch (e) {
                this.onFailure();
            }
        },


        onSuccess: function (facebookUser) {
            if (this._oViewController._oDialogLogin) {
                this._oViewController._oDialogLogin.setBusy(true);
            }
            this._oViewController.getView().setBusy(true);
            var that = this;
            var mPayload = {
                login: "facebook",
                iduser: facebookUser.id,
                nome: facebookUser.name,
                sexo: facebookUser.gender,
                email: facebookUser.email,
                token: facebookUser.accessToken.substring(0, 20)
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
                if (that._oDialogLogin) {
                    that._oDialogLogin.setBusy(false);
                }
                that._oViewController._ajaxFail(jqXHR, textStatus, errorThrown);
            });
        },


        onFailure: function () {
            if (this._oViewController._oDialogLogin) {
                this._oViewController._oDialogLogin.setBusy(false);
            }
            this._oViewController.getView().setBusy(false);
            MessageBox.error(this._oViewController.getResourceBundle().getText("Login.facebookError"));
        }
    });
});
