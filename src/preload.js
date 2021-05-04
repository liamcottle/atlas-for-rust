// allow browser to use ipc
var electron = require('electron');
window.appversion = electron.remote.app.getVersion();
window.ipcRenderer = electron.ipcRenderer;

// add utils
window.uuidv4 = require('uuid').v4;
window.JSONbig = require('json-bigint')({ storeAsString: true });

// add data stores to browser window
window.DataStore = {
    Config: require('@/js/datastore/ConfigDataStore'),
    FCM: require('@/js/datastore/FCMDataStore'),
    Servers: require('@/js/datastore/ServerDataStore'),
};

/**
 * Rust+ recently changed the login flow, which no longer sends auth data in the URL callback.
 *
 * Auth data is now sent to a ReactNativeWebView.postMessage handler on the main window object,
 * which is available to the Rust+ app since it is a ReactNative app.
 *
 * We can emulate this functionality by modifying the window object ourselves. Which allows allows us to forward
 * the auth data to background.js via our ipc calls.
 */
window.ReactNativeWebView = {
    postMessage: function(message) {

        // parse auth data, converting BigInteger steam id to string
        var auth = JSONbig.parse(message);

        // send auth data back to background.js
        window.ipcRenderer.send('connect-with-rustplus.react-native-callback', {
            'steamId': auth.SteamId,
            'token': auth.Token,
        });

    },
};