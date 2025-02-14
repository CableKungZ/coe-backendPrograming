const express = require("express");
const passport = require("passport");
const mongoDbInstant = require("../db/mongoDb");

const bcrypt = require("bcrypt"); 
const { ObjectId } = require('mongodb');
const router = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "order";
const middleware = require("../middlewares/userRole")
const jwtAuth = passport.authenticate("jwt-verify", { session: false });

router.post("/order",
    jwtAuth,
    middleware.isUser,
    async (req, res) => {
        try {
            const { productId, quantity } = req.body; 
    
            const userId = req.user._id;
    
            if (!productId || !quantity) {
                return res.status(400).send({ message: 'Product ID and quantity are required.' });
            }
    
            await client.connect();
            const db = client.db(mongoDbInstant.getDbName());
            const productCollection = db.collection("prod");
            const orderCollection = db.collection(collectionName);
    
            // Find product by ID
            const product = await productCollection.findOne({ _id: new ObjectId(productId) });
    
            if (!product) {
                return res.status(404).send({ message: 'Product not found.' });
            }
    
            // Check if enough stock is available
            if (product.amount < quantity) {
                return res.status(400).send({ message: 'Not enough stock available.' });
            }
    
            // Reduce stock
            const newAmount = product.amount - quantity;
            await orderCollection.updateOne(
                { _id: new ObjectId(productId) },
                { $set: { amount: newAmount } }
            );
    
            // Create an order for the user
            const ordersCollection = db.collection("orders");
            const order = {
                userId,
                productId: new ObjectId(productId),
                quantity,
                totalPrice: product.price * quantity,
                status: 'Pending',
                createdAt: new Date(),
            };
    
            const result = await ordersCollection.insertOne(order);
    
            return res.status(201).send({
                message: 'Order placed successfully.',
                orderId: result.insertedId,
            });
        } catch (error) {
            return res.status(500).send({ message: 'Error placing order.', error });
        } finally {
            await client.close();
        }
});

router.get("/orders/:id", async (req, res) => {
    try {
        const { id } = req.params; 

        if (!userId) {
            return res.status(400).send({ message: 'User ID is required.' });
        }

        await client.connect();
        const db = client.db(mongoDbInstant.getDbName());
        const ordersCollection = db.collection("orders");

        const orders = await ordersCollection.find({ userId }).toArray();

        if (!orders.length) {
            return res.status(404).send({ message: 'No orders found for this user.' });
        }

        return res.status(200).send({ orders });
    } catch (error) {
        return res.status(500).send({ message: 'Error fetching orders.', error });
    } finally {
        await client.close();
    }
});


module.exports = router;

  