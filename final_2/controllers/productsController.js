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
      const { name, price, category } = req.body;
  
      await client.connect();
  
      const db = client.db(mongoDbInstant.getDbName());
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

router.post("/order",
    jwtAuth,
    middleware.isAdmin,
    async (req, res) => {
        try {
            const { productId, quantity } = req.body; 
    
            // User ID is fetched from the JWT token
            const userId = req.user._id;
    
            if (!productId || !quantity) {
                return res.status(400).send({ message: 'Product ID and quantity are required.' });
            }
    
            await client.connect();
            const db = client.db(mongoDbInstant.getDbName());
            const productCollection = db.collection("prod");
    
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
            await productCollection.updateOne(
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

  