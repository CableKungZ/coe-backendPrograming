const express = require("express")

const multer = require("multer");
const bodyParser = require("body-parser");

/* const dataJson = require("./products.json");
 */
const upload = multer();
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(upload.array());

const port = 3001;

app.get(
    "/",
    (req,res) => {
        res.send({
            status: "success",
            name: "1",
            data : [
                username = "Hi",
                password = "GG"
            ]
        });
    }
);

app.post(
    "/p",
    (req,res) => {
        res.send({
            status: "success",
        });
    }
);

app.post(
    "/login",
    (req,res) => {
        const username = req.body.username
        const password = req.body.password

        res.send({
            data: {
                username,
                password
            }
        });
    }
);


app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
})