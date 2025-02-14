const passport = require("passport");
const express = require("express")
const mongoDbInstance = require("../db/mongoDb");
const { ObjectId } = require('mongodb');
const router = express.Router();

const client = mongoDbInstance.getMongoClient();
const db = client.db(mongoDbInstance.getDbName());

const collectionName = "products";
const jwtAuth = passport.authenticate("jwt-verify", { session: false });

const middleware = require("../middlewares/userRole")
const validator = require("../validator/prod");
const { validationResult } = require("express-validator");

router.get(
    "/",
   
    async (req,res) => {
        await client.connect();
        const db = client.db(mongoDbInstance.getDbName());
        const collection = db.collection(collectionName);

        const products = await collection.find({}).toArray();

        res.send({
            message: "success",
            data: products
        })
    }
);

router.get("/:id",
  
  async (req,res) => {
    const id = req.params.id;

    await client.connect();
    const db = client.db(mongoDbInstance.getDbName());
    const collection = db.collection(collectionName);

    const product = await collection.find({
        _id : new ObjectId(id)
    }).toArray();

    res.send(
        {
            message: "successs",
            product,
        }
    )
})


// TASK 4 SHOW ITEMS BY CATEGORY ID

router.get("/cate/:id",
 
  async (req,res) => {
    const category = req.params.id;
    await client.connect();
    const db = client.db(mongoDbInstance.getDbName());
    const collection = db.collection(collectionName);

    const product = await collection.find({
        category : category
    }).toArray();

    res.send(
        {
            message: "successs",
            product,
        }
    )
})

// Task 3
router.post("/add", 

  async (req, res) => {
    try {

      const { name, price, category } = req.body;
  
      const errorResult = validationResult(req);

      if(!errorResult.isEmpty()){
           return res.status(400).send({
            message: "Validation error",
            errors: errorResult.array(),
          });
      }
  
  
      await client.connect();
  
      const db = client.db(mongoDbInstance.getDbName());
      const collection = db.collection("products");
  
      const result = await collection.insertOne({ name, price, category });
  
      return res.status(201).send({
        message: "Product added successfully.",
        result,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Error adding product.",
        error: error.message || error,
      });
    } finally {
      await client.close();
    }
  });

// Task 4
router.put("/edit/:id", 
  
  async (req, res) => {
  try {

    const { id } = req.params;
    const { name, price, category } = req.body;

    const errorResult = validationResult(req);

    if(!errorResult.isEmpty()){
         return res.status(400).send({
          message: "Validation error",
          errors: errorResult.array(),
        });
    }


    await client.connect();

    const db = client.db(mongoDbInstance.getDbName());
    const collection = db.collection(collectionName);

    const updatedUser = await collection.updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { name, price, category } }
    );

    if (updatedUser.matchedCount === 0) {
      return res.status(404).send({
        message: "Product not found",
      });
    }

    return res.status(200).send({
      message: "Product updated successfully",
      updatedUser,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error updating Product",
      error: error.message || error,
    });
  } finally {
    await client.close();
  }
});
// Task 5 
router.delete("/delete/:id", jwtAuth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).send({
              message: "Forbidden: Admin role required."
            });
          }
  
      const { id } = req.params;
  
      if (!mongoDbInstance.ObjectId.isValid(id)) {
        return res.status(400).send({
          message: "Invalid ID format",
        });
      }
  
      await client.connect();
  
      const db = client.db(mongoDbInstance.getDbName());
      const collection = db.collection(collectionName);
  
      const deletedUser = await collection.deleteOne({ _id: new mongoDbInstance.ObjectId(id) });
  
      if (deletedUser.deletedCount === 0) {
        return res.status(404).send({
          message: "User not found",
        });
      }
  
      return res.status(200).send({
        message: "User deleted successfully",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Error deleting user",
        error,
      });
    } finally {
      await client.close();
    }
  });

module.exports = router;