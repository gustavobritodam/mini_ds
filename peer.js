const fs = require("fs");
const net = require("net");
const axios = require("axios");
const crypto = require("crypto");

const port = process.env.PORT;
const folder = process.env.FOLDER || "_test_files/";
const indexBaseAddress = "http://localhost:5001";
const peerBaseAddress = "localhost";
const fileNames = fs.readdirSync(folder);

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  namedCurve: "secp256k1",
  publicKeyEnconding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEnconding: {
    type: "pkcs8",
    format: "der",
  },
});

const registerFiles = async () => {
  const indexAddress = `${indexBaseAddress}/register`;
  const address = `${peerBaseAddress}:${port}`;
  let files = [];

  fileNames.map((name) => {
    files.push({
      name,
      address,
      publicKey: publicKey
        .export({ format: "pem", type: "spki" })
        .toString("hex"),
      hashDigest: crypto
        .createHash("sha256")
        .update(name, address)
        .digest("hex"),
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
  const indexAddress = `${indexBaseAddress}/files/${port}`;
  const response = await axios.get(indexAddress);
  return response.data;
};

const main = async () => {
  await registerFiles();

  const files = await getFiles();

  files
    .filter(({ name }) => !fileNames.includes(name))
    .map(({ address, name, publicKey: seedPublicKeyPEM, hashDigest }) => {
      let timestamp = new Date().getTime();
      hash = crypto.createHash("sha256").update(name, address).digest("hex");
      if (hash != hashDigest) {
        console.log(`Something went wrong with ${name} file transfer from ${indexBaseAddress} to ${address} at ${timestamp}`);
        return;
      }

      const [host, port] = address.split(":");
      const socket = net.createConnection({ port, host }, () => {});
      socket.write(name);
      socket.on("data", (encryptedData) => {
        const seedPublicKey = crypto.createPublicKey({
          key: seedPublicKeyPEM.toString(),
          format: "pem",
          type: "spki",
        });

        const fileContent = crypto.publicDecrypt(seedPublicKey, encryptedData);
        fs.writeFileSync(`${folder}/${name}`, fileContent);
        socket.end();
        console.log(`Received ${name} from ${indexBaseAddress} at ${timestamp}`);
      });
    });

  const server = net.createServer((socket) => {
    socket.on("data", (data) => {
      const fileName = data.toString();      
      const fileContent = fs.readFileSync(`${folder}/${fileName}`);
      const encryptedFile = crypto.privateEncrypt(privateKey, fileContent);

      socket.write(encryptedFile);
      let timestamp = new Date().getTime();
      console.log(`Sending ${fileName} to ${socket.remoteAddress} at ${timestamp}`);
      socket.end();
    });
  });
  server.listen(port, () => console.log("Listening on port" + port));
};

main();
