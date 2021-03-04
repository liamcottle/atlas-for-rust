const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let url
if(process.env.NODE_ENV === 'DEV'){
    // use local server in dev
    url = 'http://localhost:8080/';
} else {
    // use dist folder in prod
    url = `file://${process.cwd()}/dist/index.html`;
}

app.on('ready', () => {
    let window = new BrowserWindow({width: 800, height: 600});
    window.loadURL(url);
});