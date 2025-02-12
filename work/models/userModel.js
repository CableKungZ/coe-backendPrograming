const mongoDbInstant = require("../db/mongoDb");
const client = mongoDbInstant.getMongoClient();

class UserModel {
    static collectionName = "users";
  
    static async findAll() {
      await client.connect();
  
      const db = client.db(mongoDbInstant.getDbName());
      const collection = db.collection(this.collectionName);
  
      const users = await collection.find().toArray();
  
      return users;
    }
  
    static async create({ username, password, full_name, role }) {
      await client.connect();
  
      const db = client.db(mongoDbInstant.getDbName());
      const collection = db.collection(this.collectionName);
  
      const user = {
        username: username,
        password_hash: password,
        full_name: full_name,
        role: role,
      };
  
      return await collection.insertOne(user);
    }
  }
  

module.exports = UserModel;
  