const ElectronStore = new (require('electron-store'))();

const KEY_STEAM_ID = 'steam_id';
const KEY_RUSTPLUS_TOKEN = 'rustplus_token';

class ConfigDataStore {

    static getSteamId() {
        return ElectronStore.get(KEY_STEAM_ID);
    }

    static setSteamId(steamId) {
        ElectronStore.set(KEY_STEAM_ID, steamId);
    }

    static clearSteamId() {
        ElectronStore.delete(KEY_STEAM_ID);
    }

    static getRustPlusToken() {
        return ElectronStore.get(KEY_RUSTPLUS_TOKEN);
    }

    static setRustPlusToken(rustPlusToken) {
        ElectronStore.set(KEY_RUSTPLUS_TOKEN, rustPlusToken);
    }

    static clearRustPlusToken() {
        ElectronStore.delete(KEY_RUSTPLUS_TOKEN);
    }

}

module.exports = ConfigDataStore;