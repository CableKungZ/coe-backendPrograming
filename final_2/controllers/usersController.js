const passport = require("passport");
const express = require("express");
const bcrypt = require("bcrypt");
const mongoDbInstant = require("../db/mongoDb");

const middleware = require("../middlewares/userRole")
const validator = require("../validator/user");
const { validationResult } = require("express-validator");

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

router.post("/create", async (req,res) => {
    try {
        const { username , password , full_name , role } = req.body;
        await client.connect();
        const db = client.db(mongoDbInstant.getDbName());
        const collection = db.collection(collectionName);
        // check user
        const userExists = await collection.countDocuments({ username });
        if (userExists > 0) {
          return res.status(400).send({
            message: "User already exists",
          });
        }
        const passwordHash = bcrypt.hashSync(password, saltRounds);

        const user = {
            username,
            password_hash: passwordHash,
            full_name,
            role,
          };
        
        const result = await collection.insertOne(user);
        return res.status(200).send({
            message: "User created successfully",
            result,
          });


    } catch (error) {
        
        return res.status(500).send({
            message: "Error creating user",
            error,
          });

    } finally {
        await client.close()
    }
})

module.exports = router;
