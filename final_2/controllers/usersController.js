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

router.post("/create", async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;
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

router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { username, full_name, role } = req.body;

        await client.connect();

        const db = client.db(mongoDbInstant.getDbName());
        const collection = db.collection(collectionName);

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
            error: error.message || error, // Include meaningful error information
        });
    } finally {
        await client.close();
    }
})

router.delete("/delete/:id", async (req, res) => {
    try {
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
})

module.exports = router;
