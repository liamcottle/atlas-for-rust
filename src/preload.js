// allow browser to use ipc
window.ipcRenderer = require('electron').ipcRenderer;
window.ElectronStore = new (require('electron-store'))();
