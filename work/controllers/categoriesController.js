const passport = require("passport");
const express = require("express")
const mongoDbInstance = require("../db/mongoDb");
const { ObjectId } = require('mongodb');
const router = express.Router();

const client = mongoDbInstance.getMongoClient();
const db = client.db(mongoDbInstance.getDbName());

const collectionName = "categories";
const jwtAuth = passport.authenticate("jwt-verify", { session: false });

const middleware = require("../middlewares/userRole")
const validator = require("../validator/cate");
const { validationResult } = require("express-validator");

router.get(
    "/",
    jwtAuth,
    middleware.UserOrAdmin,
    async (req,res) => {
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


        const products = await collection.find({}).toArray();

        res.send({
            message: "success",
            data: products
        })
    }
);

// Task 3
router.post("/add", 
  jwtAuth, 
  middleware.isAdmin,
  validator.createCategory,
  async (req, res) => {
    try {

      const { categoryName } = req.body;

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
  
      const result = await collection.insertOne({ categoryName });
  
      return res.status(201).send({
        message: "Category added successfully.",
        result,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Error adding Category.",
        error: error.message || error,
      });
    } finally {
      await client.close();
    }
  });

// Task 4
router.put("/edit/:id", 
  jwtAuth,
  middleware.isAdmin,
  validator.updateCategory,
  async (req, res) => {
  try {

    const { id } = req.params;
    const { name } = req.body;

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
      { $set: { name } }
    );

    if (updatedUser.matchedCount === 0) {
      return res.status(404).send({
        message: "Category not found",
      });
    }

    return res.status(200).send({
      message: "Category updated successfully",
      updatedUser,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error updating Category",
      error: error.message || error,
    });
  } finally {
    await client.close();
  }
});

module.exports = router;