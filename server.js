const express = require("express");
var bodyParser = require("body-parser");

const app = express();
const port = 5001;

let files = [];

app.use(bodyParser.json());

app.post("/register", (req, res) => {
  const body = req.body;
  //console.log("files ", body.files, "received");
  body.files.forEach((f) => {
    let timestamp = new Date().getTime();
    console.log(`Received ${f.name} from ${f.address}at ${timestamp}`);
  });

  files = files.concat(body.files);
  res.sendStatus(200);
});

app.get("/files/:req_port", (req, res) => {
  files.forEach((f) => {
    let timestamp = new Date().getTime();
    console.log(`Sending ${f.name} to ${req.ip}:${req.params.req_port} at ${timestamp}`);
  });
  res.send(files);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});


