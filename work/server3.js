require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const path = requre("path")

const port = 3000;
const app = express();

app.use("view engine","ejs");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.send({
    message: "server is running",
    version: 1.2,
    secret: process.env.jwt_secret,
  });
});

app.listen(port, () => {
  console.log(`Server running at localhost:${port}`);
});
