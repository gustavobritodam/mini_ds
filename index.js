//index.js
//process.env.PORT = 3000
//console.log(process.env)
if(!process.env.PORT)
    throw Error("Variável de ambiente PORT não informada");

const port = process.env.PORT;
console.log(process.argv)

const Peer = require("./Peer");
const peer = new Peer(port);

process.argv.slice(2).forEach( otherPeerAddress => 
    peer.connectTo(otherPeerAddress)
  );

peer.onConnection = socket => socket.write("Hi! I'm on port " + port);

process.stdin.on('data', data => {
    const message = data.toString().replace(/\n/g, "");
    peer.broadcast(message);
})
