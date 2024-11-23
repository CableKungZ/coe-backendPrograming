// import express from "express";
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");

const dataJson = require("./products.json");

const upload = multer();
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(upload.array());

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/json", (req, res) => {
  res.send(dataJson);
});

app.get("/json/:id", (req, res) => {
  const id = req.params.id;
  const product = dataJson.find((p) => p.id == id);

  res.send(product);
});

app.get("/params", (req, res) => {
  const query = req.query;
  res.send(query);
});

app.post("/product", (req, res) => {
  const data = req.body;
  console.log(req.body);
  res.send({
    message: "Create new product",
    data_form_body: data,
  });
});

app.listen(port, () => {
  console.log(`Server running at localhost:${port}`);
});
