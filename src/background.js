const electron = require('electron');
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const app = electron.app;
const ipcMain = electron.ipcMain;
const protocol = electron.protocol;
const BrowserWindow = electron.BrowserWindow;
const ElectronStore = require('electron-store');
const ExpoPushTokenManager = require('./ipc/main/ExpoPushTokenManager');
const FCMNotificationManager = require('./ipc/main/FCMNotificationManager');
const RustCompanionManager = require('./ipc/main/RustCompanionManager');
const querystring = require('querystring');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
    scheme: 'app',
    privileges: {
        secure: true,
        standard: true,
    },
}]);

// setup electron store
ElectronStore.initRenderer();

// init ipc managers
let expoPushTokenManager = new ExpoPushTokenManager(ipcMain);
let fcmNotificationManager = new FCMNotificationManager(ipcMain);
let rustCompanionManager = new RustCompanionManager(ipcMain);

// init ipc callback to auth with rust+
ipcMain.on('connect-with-rustplus', (ipcEvent, data) => {

    let authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        autoHideMenuBar: true
    });

    authWindow.webContents.on('will-redirect', (event, urlString) => {
        if(urlString.startsWith('http://localhost/rustplus-login-callback')){

            // prevent redirect
            event.preventDefault();

            // get query parameters
            let queryParameters = querystring.parse(new URL(urlString).searchParams.toString());

            // send steamId and token back to renderer process
            ipcEvent.sender.send('connect-with-rustplus.success', {
                'steamId': queryParameters.steamId,
                'token': queryParameters.token,
            });

            // close auth window
            authWindow.destroy();

        }
    });

    // load rust+ companion login page
    authWindow.loadURL("https://companion-rust.facepunch.com/login?returnUrl=" + encodeURIComponent(`http://localhost/rustplus-login-callback`));

});

app.on('ready', () => {

    let window = new BrowserWindow({
        width: 1200, height: 800,
        webPreferences: {
            enableRemoteModule: true, // get version in about modal
            contextIsolation: false, // required for preload to work in browser
            preload: __dirname + '/preload.js'
        },
    });

    // open links clicked in main window in external os browser
    window.webContents.on('new-window', async function(event, url){
        event.preventDefault();
        await electron.shell.openExternal(url);
    });

    if(process.env.WEBPACK_DEV_SERVER_URL){
        // use local server in dev
        window.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        window.loadURL('app://./index.html')
    }

});