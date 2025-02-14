const express = require("express");
const mongoDbInstant = require("../db/mongoDb");
const bcrypt = require("bcrypt"); 
const { ObjectId } = require('mongodb'); 
const router = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "users";
const passport = require("passport");
const middleware = require("../middlewares/userRole")
const validator = require("../validator/user");
const { validationResult } = require("express-validator");

const saltRounds = 10;
const jwtAuth = passport.authenticate("jwt-verify", { session: false });

async function getDbConnection() {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    return db.collection(collectionName);
}

router.get("/",
  jwtAuth,
  middleware.isAdmin,
   async (req, res) => {
    try {
        const collection = await getDbConnection();
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
//สามารถแก้ไขข้้อมูลสินค้าได้ด้วย product id [admin]
router.post("/create", 
    jwtAuth,
    middleware.isAdmin,
    validator.createUser,
    async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;
        const collection = await getDbConnection();

        const userExists = await collection.countDocuments({ username });
        if (userExists > 0) {
            return res.status(400).send({
                message: "User already exists",
            });
        }

        const errorResult = validationResult(req);
            
        if(!errorResult.isEmpty()){
             return res.status(400).send({
              message: "Validation error",
              errors: errorResult.array(),
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
//สามารถอ่านรายการสินค้าในระบบและแสดงจำนวนคงเหลือได้ [admin&user]
router.put("/update/:id",
    jwtAuth,
    middleware.isAdmin,
    validator.updateUser,
     async (req, res) => {
    try {
        const { id } = req.params;
        const { username, full_name, role } = req.body;

        const errorResult = validationResult(req);
            
        if(!errorResult.isEmpty()){
             return res.status(400).send({
              message: "Validation error",
              errors: errorResult.array(),
            });
        }
    


        const collection = await getDbConnection();

        const updatedUser = await collection.updateOne(
            { _id: new ObjectId(id) },
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
        console.error("Error updating user:", error);
        return res.status(500).send({
            message: "Error updating user",
            error: error.message || error,
        });
    } finally {
        await client.close();
    }
});
//สามารถลบสินค้าในระบบได้ด้วย product id [admin]
router.delete("/delete/:id",
    jwtAuth,
    middleware.isAdmin,
     async (req, res) => {
    try {
        const { id } = req.params;

        const collection = await getDbConnection();

        const deletedUser = await collection.deleteOne({ _id: new ObjectId(id) });

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
