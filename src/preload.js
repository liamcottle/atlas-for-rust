// allow browser to use ipc
var electron = require('electron');
window.appversion = electron.remote.app.getVersion();
window.ipcRenderer = electron.ipcRenderer;

// add utils
window.uuidv4 = require('uuid').v4;

// add data stores to browser window
window.DataStore = {
    Config: require('@/js/datastore/ConfigDataStore'),
    FCM: require('@/js/datastore/FCMDataStore'),
    Servers: require('@/js/datastore/ServerDataStore'),
};