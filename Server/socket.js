let _io = null;

const init = (httpServer, options = {}) => {
    const { Server } = require('socket.io');
    _io = new Server(httpServer, options);
    return _io;
};

const getIO = () => {
    if (!_io) {
        throw new Error('[Socket] Socket.IO has not been initialised. Call socket.init() first.');
    }
    return _io;
};

module.exports = { init, getIO };
