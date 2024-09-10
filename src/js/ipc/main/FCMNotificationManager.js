const {
    AndroidFCM,
    Client: PushReceiverClient,
} = require('@liamcottle/push-receiver');

/**
 * This class is responsible for registering a new android device with fcm
 * as well as being able to listen for notifications after registering.
 *
 * Events are received via ipc from the renderer process, executed here in the main
 * process, and results are then sent back to the renderer process via ipc.
 */
class FCMNotificationManager {

    constructor(ipcMain) {

        // global vars
        this.ipcMain = ipcMain;
        this.notificationClient = null;

        // register ipc channel handlers
        ipcMain.on('push-receiver.register', (event, data) => this.onRegister(event, data));
        ipcMain.on('push-receiver.notifications.listen.start', (event, data) => this.onStartListeningForNotifications(event, data));
        ipcMain.on('push-receiver.notifications.listen.stop', (event, data) => this.onStopListeningForNotifications(event, data));

    }

    onRegisterSuccess(event, credentials) {
        event.sender.send('push-receiver.register.success', {
            'credentials': credentials,
        });
    }

    onRegisterError(event, error) {
        event.sender.send('push-receiver.register.error', {
            'error': error,
        });
    }

    onNotificationListenStart(event) {
        event.sender.send('push-receiver.notifications.listen.started');
    }

    onNotificationListenStopped(event) {
        event.sender.send('push-receiver.notifications.listen.stopped');
    }

    onNotificationReceived(event, data) {
        event.sender.send('push-receiver.notifications.received', data);
    }

    onNotificationError(event, error) {
        event.sender.send('push-receiver.notifications.error', {
            'error': error,
        });
    }

    /**
     * Register with FCM to obtain credentials
     * @param event
     * @param data
     */
    async onRegister(event, data) {
        try {

            // register with gcm/fcm
            const credentials = await AndroidFCM.register(data.apiKey, data.projectId, data.gcmSenderId, data.gmsAppId, data.androidPackageName, data.androidPackageCert);

            // registering was successful
            this.onRegisterSuccess(event, credentials);

        } catch (error) {

            // registering failed with error
            this.onRegisterError(event, error);

        }
    }

    /**
     * Listen for notifications from FCM with existing credentials
     * @param event
     * @param data
     */
    async onStartListeningForNotifications(event, data) {
        try {

            // get data
            let credentials = data.credentials;
            let persistentIds = data.persistentIds || [];

            // start listening for notifications
            const androidId = credentials.gcm.androidId;
            const securityToken = credentials.gcm.securityToken;
            const client = new PushReceiverClient(androidId, securityToken, persistentIds);
            client.on('ON_DATA_RECEIVED', (data) => {

                // notification was received
                this.onNotificationReceived(event, data);

            });

            client.connect();

            // listening for notifications
            this.onNotificationListenStart(event);

        } catch (error) {

            // listening for notifications failed with error
            this.onNotificationError(event, error);

        }
    }

    /**
     * Stop listening for notification from FCM
     * @param event
     * @param data
     */
    async onStopListeningForNotifications(event, data) {

        // stop listening for notifications
        if(this.notificationClient){
            this.notificationClient.destroy();
        }

        // stopped listening for notifications
        this.onNotificationListenStopped(event);

    }

}

module.exports = FCMNotificationManager;