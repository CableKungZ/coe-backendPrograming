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



let items = [
    {
        id: 1,
        name:"ruler"
    },
    {
        id: 2,
        name:"paper"
    }
]

app.get(
    "/",
    (req,res) => {
        res.send({
            message:"Hello"
        });

    }
);

// Task 1
app.get(
    "/items",(req,res) =>{
        res.send(items)
    }
)
// Task 2
app.get(
    "/item/:id",(res,req) => {
        const id = req.params.id;
        const user = items.find(item => item.id == id)

        res.send({
            message:"successful",
            data: user
        })
    }
)
// Task 3
app.post(
    "/add",
    (req,res) => {
        const id = req.body.id;
        const name = req.body.name;

        items.push(
            {
                id,
                name
            }
        )
        res.send(
            "Created Successfully"
        )

    }
)
// Task 4
app.put("/edit", (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const data = items.find(item => item.id == id);
    data.name = name;
    res.send("Edit successfully.");
});

// Task 5 
app.delete(
    "/delete",
    (req,res) => {
        const id = req.body.id;
        const data = items.findIndex(item => item.id == id)
        items.splice(data,1)
        res.send(
            "Remove Successfully"
        )

    }
)


app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
})