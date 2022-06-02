const fs = require("fs");
const net = require("net");
const axios = require("axios");

const port = process.env.PORT;
const folder = "_test_files/";
const registerFiles = async () => {
  const indexAddress = "http://localhost:5001/register";
  const address = `localhost:${port}`;
  const fileNames = fs.readdirSync(folder);
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

const main = async () => {
  await registerFiles();
  
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
