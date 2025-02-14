const express = require("express");
const passport = require("passport");
const mongoDbInstant = require("../db/mongoDb");

const bcrypt = require("bcrypt");
const { ObjectId } = require('mongodb');
const router = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "prod";
const middleware = require("../middlewares/userRole")
const jwtAuth = passport.authenticate("jwt-verify", { session: false });

async function getDbConnection() {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    return db.collection(collectionName);
}

//สามารถสร้าง product ได้ [admin]
router.post("/add",
    jwtAuth,
    middleware.isAdmin,
    async (req, res) => {
        try {

            const { name, amount } = req.body;

            await client.connect();

            const db = client.db(mongoDbInstant.getDbName());
            const collection = db.collection(collectionName);

            const result = await collection.insertOne({ name, amount });

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
    jwtAuth,
    middleware.isAdmin,
    async (req, res) => {
        try {

            const { id } = req.params;
            const { name, amount } = req.body;

            await client.connect();

            const db = client.db(mongoDbInstant.getDbName());
            const collection = db.collection(collectionName);

            const updatedUser = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { name, amount } }
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

router.get("/products", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(mongoDbInstant.getDbName());
        const collection = db.collection(collectionName);

        const products = await collection.find().toArray();
        res.send(products);
    } catch (error) {
        res.status(500).send({ message: "Error fetching products", error });
    } finally {
        await client.close();
    }
});

// สามารถลบสินค้าในระบบได้ด้วย product id [admin]
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
                    message: "Item not found",
                });
            }

            return res.status(200).send({
                message: "item deleted successfully",
            });
        } catch (error) {
            return res.status(500).send({
                message: "Error deleting item",
                error,
            });
        } finally {
            await client.close();
        }
    });

router.post("/order", jwtAuth, middleware.isUser, async (req, res) => {

    try {
            const userId = req.user._id;
            console.log("Request received for placing order");
        const { productId, quantity } = req.body;
        console.log("product ID : ", productId);
        console.log("quantity : ", quantity);
        console.log("userId", userId);

        await client.connect();
        const db = client.db(mongoDbInstant.getDbName());
        const productCollection = db.collection("prod");

        console.log(`Searching for product with ID: ${productId}`);
        const product = await productCollection.findOne({ _id: new ObjectId(productId) });

        if (!product) {
            console.log("Product not found");
            return res.status(404).send({ message: 'Product not found.' });
        }

        console.log(`Found product: ${product.name}. Checking stock...`);
        if (product.amount < quantity) {
            console.log("Not enough stock available");
            return res.status(400).send({ message: 'Not enough stock available.' });
        }

        console.log("Reducing stock...");
        const newAmount = product.amount - quantity;
        await productCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: { amount: newAmount } }
        );

        console.log("Creating an order...");
        const ordersCollection = db.collection("orders");
        const order = {
            userId,
            productId: new ObjectId(productId),
            quantity,
        };

        const result = await ordersCollection.insertOne(order);

        console.log(`Order placed successfully. Order ID: ${result.insertedId}`);
        return res.status(201).send({
            message: 'Order placed successfully.',
            orderId: result.insertedId,
        });
    } catch (error) {
        console.error("Error occurred during order placement:", error);  // แสดง Error Logs ใน Console
        return res.status(500).send({ message: 'Error placing order.', error });
    }
});


router.get("/orders",
    jwtAuth,
    async (req, res) => {
        try {
            const userId = req.user._id;
            console.log("user", req.user._id);

            if (!userId) {
                return res.status(400).send({ message: 'User ID is required from token.' });
            }

            console.log(`Fetching orders for userId: ${userId}`);

            await client.connect();
            const db = client.db(mongoDbInstant.getDbName());
            const ordersCollection = db.collection("orders");

            const orders = await ordersCollection.find({ userId: userId }).toArray();

            if (!orders.length) {
                return res.status(404).send({ message: 'No orders found for this user.' });
            }

            return res.status(200).send({ orders });
        } catch (error) {
            console.error("Error occurred while fetching orders:", error);
            return res.status(500).send({ message: 'Error fetching orders.', error });
        } finally {
            await client.close();
        }
    });




module.exports = router;

