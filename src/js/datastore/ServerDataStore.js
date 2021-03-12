const ElectronStore = new (require('electron-store'))();

const KEY_SERVERS = 'servers';

class ServerDataStore {

    static getServers() {
        return ElectronStore.get(KEY_SERVERS, []);
    }

    static setServers(servers) {
        ElectronStore.set(KEY_SERVERS, servers);
    }

    static addOrUpdateServer(server) {

        // get servers
        var servers = this.getServers();

        // remove server if it already exists
        servers = servers.filter((existingServer) => {
            return existingServer.id !== server.id;
        });

        // add new server
        servers.push(server);

        // update servers
        this.setServers(servers);

    }

    static removeServerById(id) {

        // get servers
        var servers = this.getServers();

        // remove server by id
        servers = servers.filter((existingServer) => {
            return existingServer.id !== id;
        });

        // update servers
        this.setServers(servers);

    }

    static clearServers() {
        ElectronStore.delete(KEY_SERVERS);
    }

}

module.exports = ServerDataStore;