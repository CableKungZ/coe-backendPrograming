const express = require("express");
const mongoDbInstant = require("../db/mongoDb");

const { ObjectId } = require('mongodb');
const router = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "prod";

const saltRounds = 10;

router.get("/",
    async (req, res) => {
    try {
      await client.connect();
      const db = client.db(mongoDbInstant.getDbName());
      const collection = db.collection(collectionName);
  
      const users = await collection.find().toArray();
  
      return res.send(users);
    } catch (error) {
      return res.status(500).send({
        message: "Error fetching users",
        error,
      });
    } finally {
      await client.close();
    }
  });

router.get("")

module.exports = router;
//สามารถสร้าง product ได้ [admin]
router.post("/add", 
  
  async (req, res) => {
    try {

      const { name, amount } = req.body;
  
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
  //สามารถแก้ไขข้้อมูลสินค้าได้ด้วย product id [admin]
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


  