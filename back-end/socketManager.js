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

    addUser(socket, user_id, sessionToken) {
        const userData = this.database.fetchUser(user_id);
        
        if (!userData.success) {
            socket.close(CLOSE_CODE_UNAUTHORIZED, "Unauthorized access");
            return (false);
        }

        let userSockets = this.userToSocket.get(user_id) || [];

        if (userSockets.includes(socket))
            return (true);

        userSockets.push(socket);
        this.userToSocket.set(user_id, userSockets);
        this.startSocketmonitor(socket, sessionToken);

        socket.on('close', () => this.deleteUserSocket(socket, user_id));
        console.log("new socket connection by user_id: ", user_id);
        return (true);
    }

    getUserSockets(user_id) {
        return (this.userToSocket.get(user_id) || []);
    }

    isUserOnline(user_id) {
        return (this.userToSocket.has(user_id));
    }

    send(user_id, message) {
        if (!message) return;
        message = JSON.stringify(message);
        const userSockets = this.userToSocket.get(user_id) || [];

        userSockets.forEach(socket => {
            if (socket.readyState === WebSocket.OPEN)
                socket.send(message);
        });
    }

    startSocketmonitor(socket, sessionToken) {
        if (this.socketTimers.has(socket))
            return ;

        const monitor = () => {
            if (!this.database.verifySession(sessionToken).success)
                socket.terminate();

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

    deleteUserSocket(socket, user_id) {
        let userSockets = this.userToSocket.get(user_id) || [];
        let socketIndex = userSockets.indexOf(socket);

        if (socketIndex < 0)
            return ;

        userSockets.splice(socketIndex, 1);

        if (userSockets.length)
            this.userToSocket.set(user_id, userSockets);
        else
            this.userToSocket.delete(user_id);

        socket.off('close', () => this.deleteUser(socket));
        clearInterval(this.socketTimers.get(socket));
        this.socketTimers.delete(socket);

        if (socket.readyState < 2)
            socket.close(CLOSE_CODE_NORMAL);
        console.log("socket disconnected by user_id: ", user_id);
    }
}

export default SocketManager;