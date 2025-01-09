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

const users = [
    {
        id: 1,
        username: "user 1",
    },
    {
        id: 2,
        username : "user 2"
    }
]

app.get(
    "/",
    (req,res) => {
        res.send({
            message:"version1"
        });

    }
);

app.get(
    "/p",
    (req,res) => {
        res.send(users);
    }
);

app.get(
    "/users",
    (req,res) => {
        res.send(users)
    }
)

app.get(
    "/user/:id",
    (req,res) => {
        const id = req.params.id;
        const user = users.find(item => item.id == id)

        res.send({
            message:"successful",
            data: user
        })
    }
)

app.post(
    "/register",
    (req,res) => {
        const name = req.body.name;
        const age = req.body.age;

        users.push(
            {
                name,
                age
            }
        )
        res.send(/* {
            name,
            age
        } */
            "Created Successfully"
       
        )

    }
)

app.post(
    "/login",
    (req,res) => {
        const username = req.body.username
        const password = req.body.password

        users.push(
            {name,age}
        )
        res.send(/* {
            data: {
                username,
                password
            }
           
        } */
    "Created Successfully");
    }
);


app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
})