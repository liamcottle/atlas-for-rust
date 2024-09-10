const { EventEmitter } = require('events');

/**
 * This class is responsible for communicating with the ExpoPushTokenManager running
 * in the main process.
 *
 * Events are sent from here in the renderer process via ipc to the main process,
 * and results are then sent back to the renderer process via ipc.
 */
class ExpoPushTokenReceiver extends EventEmitter {

    constructor(ipcRenderer) {

        super();

        // global vars
        this.ipcRenderer = ipcRenderer;

        // register ipc channel handlers
        ipcRenderer.on('expo-push-token.register.success', (event, data) => this.onRegisterSuccess(event, data));
        ipcRenderer.on('expo-push-token.register.error', (event, data) => this.onRegisterError(event, data));

    }

    onRegisterSuccess(event, data) {
        this.emit('register.success', data);
    }

    onRegisterError(event, data) {
        this.emit('register.error', data);
    }

    /**
     * Ask the main process to register an Expo Push Token for an fcmToken.
     *
     * Events Emitted:
     * - register.success
     * - register.error
     */
    register(deviceId, projectId, appId, fcmToken) {
        ipcRenderer.send('expo-push-token.register', {
            type: 'fcm',
            deviceId: deviceId,
            development: false,
            appId: appId,
            deviceToken: fcmToken,
            projectId: projectId,
        });
    }

}

module.exports = ExpoPushTokenReceiver;