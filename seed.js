const fs = require("fs");
const net = require("net");
const axios = require("axios");

const port = process.env.PORT;
const folder = process.env.FOLDER || "_test_files/";
const seedAddress = `localhost:${port}`;
const fileNames = fs.readdirSync(folder);

const registerFiles = async () => {
  const indexAddress = "http://localhost:5001/register";
  const address = `localhost:${port}`;
  let files = [];

  fileNames.map((name) => {
    files.push({
      name,
      address,
    });
  });

  await axios.post(
    indexAddress,
    {
      files,
    },
    {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  );
};

const getFiles = async () => {
  const indexAddress = "http://localhost:5001/files";
  const response = await axios.get(indexAddress);
  return response.data;
};

const main = async () => {
  await registerFiles();

  const files = await getFiles();

  files
  .filter(({ name }) => !fileNames.includes(name))
  .map(({ address, name }) => {
    const [host, port] = address.split(":");
    const socket = net.createConnection({ port, host }, () => {});
    socket.write(`${name};${seedAddress}`);
    socket.on("data", (data) => {
      fs.writeFileSync(`${folder}/${name}`, data);
      socket.end();
      console.log("done");
    });
  });

  const server = net.createServer((socket) => {
    socket.on("data", (data) => {
      const [fileName, peerAddress] = data.toString().split(";");

      const fileContent = fs.readFileSync(`${folder}/${fileName}`);
        console.log("enviando para ", peerAddress);
      socket.write(fileContent);
      socket.end();
    });
  });
  server.listen(port, () => console.log("Ouvindo porta " + port));
};

main();
