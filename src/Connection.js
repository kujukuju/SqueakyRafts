class Connection {
    static SERVER = 'server.squeakyrafts.io';

    static socket;
    static retryTimeout;

    static everConnected = false;

    // static sendBytes = [];

    static retry = true;

    static initialize() {
        Connection.connect();
    }

    static connect() {
        if (Connection.socket) {
            return;
        }

        Connection.socket = new WebSocket('wss://' + Connection.SERVER + ':50505');
        Connection.socket.binaryType = 'arraybuffer';
        Connection.socket.addEventListener('open', (event) => {
            Connection.onOpen(event);
        });
        Connection.socket.addEventListener('message', (event) => {
            Connection.onMessage(event);
        });
        Connection.socket.addEventListener('close', (event) => {
            Connection.onClose(event);
        });
        Connection.socket.addEventListener('error', (event) => {
            Connection.onError(event);
        });
    }

    static send(bytes) {
        if (!Connection.isReady()) {
            return;
        }

        if (!(bytes instanceof Array)) {
            console.warn('Bytes are not an array.');
            return;
        }

        // Connection.sendBytes.length = bytes.length;

        // for (let i = 0; i < bytes.length; i++) {
        //     Connection.sendBytes[i] = bytes[i];
        // }

        Connection.socket.send(new Uint8Array(bytes));
    }

    static onOpen(event) {
        console.log('Connection opened. ', Connection.socket);

        Connection.everConnected = true;

        createNewClientEntity();

        Connection.send([]);
    }

    static onMessage(event) {
        if (!event.data) {
            return;
        }
        const data = event.data;
        if (!(data instanceof ArrayBuffer)) {
            console.warn('Received packet that\'s not an ArrayBuffer.');
            return;
        }

        const bytes = new Uint8Array(data);
        if (bytes.length === 0) {
            return;
        }

        // console.log('received ', bytes);
        PacketProcessor.receive(bytes);
    }

    static onClose(event) {
        console.log('Closed.  ', event);
        if (Connection.socket) {
            Connection.socket.close();
            Connection.socket = null;
        }

        // gonna reload here because this is how the players will reconnect after the server shuts down
        setTimeout(() => {
            if (!Connection.socket && Connection.everConnected) {
                location.reload();
            }
        }, 10 * 1000);
    }

    static onError(event) {
        console.log('Error. ', event);
        if (Connection.isReady()) {
            console.warn('Got an error but it\'s a ready socket.');
            return;
        }

        if (Connection.socket) {
            Connection.socket.close();
            Connection.socket = null;
        }
    }

    static isReady() {
        return Connection.socket && Connection.socket.readyState === 1;
    }

    static disconnect() {
        Connection.retry = false;
        Connection.socket.close();
    }

    static maybeRetry() {
        if (Connection.retryTimeout) {
            // only retry once
            return;
        }

        if (!Connection.retry) {
            return;
        }

        console.log('Retrying.');
        Connection.retryTimeout = setTimeout(() => {
            Connection.connect();
        }, 25000);
    }
}