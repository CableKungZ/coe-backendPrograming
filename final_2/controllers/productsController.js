const express = require("express");
const mongoDbInstant = require("../db/mongoDb");

const { ObjectId } = require('mongodb');
const router = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "users";

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

module.exports = router;
