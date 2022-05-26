// Peer.js
const net = require("net");
module.exports = class Peer {
  constructor(port) {
    this.port = port;
    this.connections = [];

    const server = net.createServer((socket) => {
      this.onSocketConnected(socket);
    });
    server.listen(port, () => console.log("Ouvindo porta " + port));
  }

  connectTo(address) {
    if (address.split(":").length !== 2)
      throw Error("O endereço do outro peer deve ser composto por host:port ");
    const [host, port] = address.split(":");
    const socket = net.createConnection({ port, host }, () => {
      this.onSocketConnected(socket);
    });
  }

  onSocketConnected(socket) {
    console.log("Nova conexão");
    socket.on("data", (data) => this.onData(socket, data));
    this.onConnection(socket);
  }

  onData(socket, data) {
    console.log("received: ", data.toString());
  }

  onConnection(socket){}
  
  broadcast(data) {
    console.log(this.connections)
    this.connections.forEach( (e) => {
      console.log(e)
      socket => socket.write(data)} )
  }
};
