const express = require("express");
var bodyParser = require("body-parser");

const app = express();
const port = 5001;

let files = [];

app.use(bodyParser.json());

app.post("/register", (req, res) => {
  const body = req.body;
  console.log("files ", body.files, "received");
  files = files.concat(body.files);

  res.sendStatus(200);
});

app.get("/files", (req, res) => {
  res.send(files);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
