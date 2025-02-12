require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const usersController = require("./controllers/usersController");

const port = 3000;
const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersController);

app.get("/", async (req, res) => {
  return res.render("home");
});

app.listen(port, () => {
  console.log(`Server running at localhost:${port}`);
});
