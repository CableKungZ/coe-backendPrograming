
// SERVER 13/12/2024
require("dotenv").config();
require("./middlewares/auth");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//  Controllers 
const productsController = require("./controllers/productsController");
const usersController = require("./controllers/usersController");
const authController = require("./controllers/authController");

const port = 3001;

app.use("/products", productsController);
app.use("/users", usersController);
app.use("/auth", authController);

app.get("/", async (req, res) => {
  res.send({
    message: "server is running",
    version: "1.0.1",
    secret: process.env.jwt_secret,
  });
});

app.listen(port, () => {
  console.log(`Server running at localhost:${port}`);
});
