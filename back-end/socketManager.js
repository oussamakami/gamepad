const TIMEOUT_MS = 2000;
const PING_INTERVAL_MS = 5000;
const CLOSE_CODE_UNAUTHORIZED = 4001;
const CLOSE_CODE_NORMAL = 1000;

class SocketManager {
    constructor(database) {
        this.database = database;
        this.userToSocket = new Map();
        this.socketTimers = new Map();
    }

    addUser(socket, userid) {
        const userData = this.database.fetchUser(userid);
        
        if (!userData.success) {
            socket.close(CLOSE_CODE_UNAUTHORIZED, "Unauthorized access");
            return (false);
        }

        let userSockets = this.userToSocket.get(userid) || [];

        if (userSockets.includes(socket))
            return (true);

        userSockets.push(socket);
        this.userToSocket.set(userid, userSockets);
        this.startSocketmonitor(socket);

        socket.on('close', () => this.deleteUser(socket, userid));
        return (true);
    }

    getUserSockets(userid) {
        return (this.userToSocket.get(userid) || []);
    }

    startSocketmonitor(socket) {
        if (this.socketTimers.has(socket))
            return ;

        const monitor = () => {
            socket.ping();

            const timeout = setTimeout(() => {
                pongHandler();
                socket.terminate();
            }, TIMEOUT_MS);

            const pongHandler = () => {
                clearTimeout(timeout);
                socket.off('pong', pongHandler);
            };
            
            socket.on('pong', pongHandler);
        };

        this.socketTimers.set(socket, setInterval(monitor, PING_INTERVAL_MS));
    }

    deleteUser(socket, userid) {
        let userSockets = this.userToSocket.get(userid) || [];
        let socketIndex = userSockets.indexOf(socket);

        if (socketIndex < 0)
            return ;

        userSockets.splice(socketIndex, 1);

        if (userSockets.length)
            this.userToSocket.set(userid, userSockets);
        else
            this.userToSocket.delete(userid);

        socket.off('close', () => this.deleteUser(socket));
        clearInterval(this.socketTimers.get(socket));
        this.socketTimers.delete(socket);

        if (socket.readyState < 2)
            socket.close(CLOSE_CODE_NORMAL);
    }
}

export default SocketManager;