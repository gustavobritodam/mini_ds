const fs = require("fs");
const net = require("net");
const axios = require("axios");

const indexAddress = "http://localhost:5001/files";
const folder = "_fetched_files";
const port = process.env.PORT;
const file = "test_file_1.txt";
const peerAddress = `localhost:${port}`;

const getFiles = async () => {
  const response = await axios.get(indexAddress);
  return response.data;
};

const main = async () => {
  const files = await getFiles();
  files.map(({ address, name }) => {
    const [host, port] = address.split(":");
    const socket = net.createConnection({ port, host }, () => {});
    socket.write(`${name};${peerAddress}`);
    socket.on("data", (data) => {
      console.log("chegou");
      fs.writeFileSync(`${folder}/${name}`, data);
      socket.end();
    });
  });

  const server = net.createServer((socket) => {});
  server.listen(port, () => {
    console.log("Listening to port: " + port);
  });
};

main();
