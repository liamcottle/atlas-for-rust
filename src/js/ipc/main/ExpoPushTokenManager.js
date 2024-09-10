const axios = require('axios');
const https = require('https');

/**
 * This class is responsible for obtaining an Expo Push Token.
 *
 * Events are received via ipc from the renderer process, executed here in the main
 * process, and results are then sent back to the renderer process via ipc.
 */
class ExpoPushTokenManager {

    constructor(ipcMain) {

        // global vars
        this.ipcMain = ipcMain;

        // register ipc channel handlers
        ipcMain.on('expo-push-token.register', (event, data) => this.onRegister(event, data));

    }

    onRegisterSuccess(event, expoPushToken) {
        event.sender.send('expo-push-token.register.success', {
            'expoPushToken': expoPushToken,
        });
    }

    onRegisterError(event, error) {
        event.sender.send('expo-push-token.register.error', {
            'error': error,
        });
    }

    /**
     * Get an Expo Push Token
     * @param event
     * @param data
     */
    async onRegister(event, data) {

        // register with expo
        axios.post('https://exp.host/--/api/v2/push/getExpoPushToken', {
            type: data.type,
            deviceId: data.deviceId,
            development: data.development,
            appId: data.appId,
            deviceToken: data.deviceToken,
            projectId: data.projectId,
        }, {

            /**
             * todo: this is insecure and should not be used, but electron v11 is not going to backport the fix
             * ignores invalid ssl certificates when registering for expo push token
             * temporary fix for: https://github.com/liamcottle/atlas-for-rust/issues/5
             */
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),

        }).then((response) => {

            // return expo push token
            this.onRegisterSuccess(event, response.data.data.expoPushToken);

        }).catch((error) => {

            // return error
            this.onRegisterError(event, error);

        });

    }

}

module.exports = ExpoPushTokenManager;