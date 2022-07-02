const fs = require("fs");
const net = require("net");
const axios = require("axios");
const crypto = require("crypto");

const port = process.env.PORT;
const folder = process.env.FOLDER || "_test_files/";
const indexBaseAddress = "http://localhost:5001"
const peerBaseAddress = "localhost"
const fileNames = fs.readdirSync(folder);

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  namedCurve: 'secp256k1',
  publicKeyEnconding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEnconding: {
    type: 'pkcs8',
    format: 'der'
  }
});


const registerFiles = async () => {
  const indexAddress = `${indexBaseAddress}/register`;
  const address = `${peerBaseAddress}:${port}`;
  let files = [];

  fileNames.map((name) => {
    files.push({
      name,
      address,
      publicKey: publicKey.export({ format: 'pem', type: 'spki' }).toString('hex')
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
  const indexAddress = `${indexBaseAddress}/files`;
  const response = await axios.get(indexAddress);
  return response.data;
};

const main = async () => {
  await registerFiles();

  const files = await getFiles();

  files
    .filter(({ name }) => !fileNames.includes(name))
    .map(({ address, name, publicKey: seedPublicKeyPEM }) => {
      const [host, port] = address.split(":");
      const socket = net.createConnection({ port, host }, () => { });
      socket.write(name);
      socket.on("data", (encryptedData) => {
        const seedPublicKey = crypto.createPublicKey({
          key: seedPublicKeyPEM.toString(), format: 'pem', type: 'spki'
        });

        const fileContent = crypto.publicDecrypt(seedPublicKey, encryptedData);
        fs.writeFileSync(`${folder}/${name}`, fileContent);
        socket.end();
        console.log(`Done! Downloaded ${name}`);
      });
    });

  const server = net.createServer((socket) => {
    socket.on("data", (data) => {
      const fileName = data.toString();

      const fileContent = fs.readFileSync(`${folder}/${fileName}`);
      console.log("Enviando para", socket.remoteAddress);

      const encryptedFile = crypto.privateEncrypt(privateKey, fileContent);

      socket.write(encryptedFile);
      socket.end();
    });
  });
  server.listen(port, () => console.log("Ouvindo porta " + port));
};

main();
