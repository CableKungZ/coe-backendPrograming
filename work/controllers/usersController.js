const passport = require("passport");
const express = require("express");
const bcrypt = require("bcrypt");
const mongoDbInstant = require("../db/mongoDb");
const middleware = require("../middlewares/userRole")
const validator = require("../validator/user");
const { validationResult } = require("express-validator");

const router = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "users";

const saltRounds = 10;
const jwtAuth = passport.authenticate("jwt-verify", { session: false });

// Get all users
router.get("/",
  jwtAuth,
  middleware.isAdmin,
  validator.createUser,
  async (req, res) => {
  try {
    const errorResult = validationResult(req);

    if(!errorResult.isEmpty()){
         return res.status(400).send({
          message: "Validation error",
          errors: errorResult.array(),
        });
    }


    

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

// Add user
router.post("/add", async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;

    await client.connect();

    const db = client.db(mongoDbInstant.getDbName());
    const collection = db.collection(collectionName);

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
    await client.close();
  }
});

// Update user
router.put("/update/:id", jwtAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({
        message: "Forbidden: Admin role required."
      });
    }

    const { id } = req.params;
    const { username, full_name, role } = req.body;

    await client.connect();

    const db = client.db(mongoDbInstant.getDbName());
    const collection = db.collection(collectionName);

    const updatedUser = await collection.updateOne(
      { _id: new mongoDbInstant.ObjectId(id) },
      { $set: { username, full_name, role } }
    );

    if (updatedUser.matchedCount === 0) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    return res.status(200).send({
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error updating user",
      error,
    });
  } finally {
    await client.close();
  }
});

// Delete user
router.delete("/delete/:id", jwtAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({
        message: "Forbidden: Admin role required."
      });
    }

    const { id } = req.params;

    await client.connect();

    const db = client.db(mongoDbInstant.getDbName());
    const collection = db.collection(collectionName);

    const deletedUser = await collection.deleteOne({ _id: new mongoDbInstant.ObjectId(id) });

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
