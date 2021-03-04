const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const Store = require('electron-store');
const ExpoPushTokenManager = require('./src/ipc/main/ExpoPushTokenManager');
const FCMNotificationManager = require('./src/ipc/main/FCMNotificationManager');
const querystring = require('querystring');

// setup electron store
Store.initRenderer();

// init ipc managers
let expoPushTokenManager = new ExpoPushTokenManager(ipcMain);
let fcmNotificationManager = new FCMNotificationManager(ipcMain);

// init ipc callback to auth with steam and rust+ companion
ipcMain.on('connect-with-steam', (ipcEvent, data) => {

    let authWindow = new BrowserWindow({
        width: 600,
        height: 500,
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
            ipcEvent.sender.send('connect-with-steam.success', {
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
        width: 800, height: 600,
        webPreferences: {
            contextIsolation: false, // required for preload to work in browser
            preload: __dirname + '/preload.js'
        },
    });

    if(process.env.NODE_ENV === 'DEV'){
        // use local server in dev
        window.loadURL('http://localhost:8080/');
    } else {
        // use dist folder in prod
        window.loadURL(`file://${process.cwd()}/dist/index.html`);
    }

});