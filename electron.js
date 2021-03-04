const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let url
if(process.env.NODE_ENV === 'DEV'){
    // use local server in dev
    url = 'http://localhost:8080/';
} else {
    // use dist folder in prod
    url = `file://${process.cwd()}/dist/index.html`;
}

// setup ipc
ipcMain.on('ping', function (event, data) {
    event.sender.send('pong');
});

app.on('ready', () => {
    let window = new BrowserWindow({
        width: 800, height: 600,
        webPreferences: {
            contextIsolation: false, // required for preload to work in browser
            preload: __dirname + '/preload.js'
        },
    });
    window.loadURL(url);
});