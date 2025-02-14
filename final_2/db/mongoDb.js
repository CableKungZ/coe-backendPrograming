const {MongoClient} = require("mongodb");

const url = process.env.mongodb_url;
const dbName = process.env.mongodb_name; 

const instance = {
    getMongoClient: () => {
        return new MongoClient(url);
    },
    getDbName: () => {
        return dbName;
    }   
}

module.exports = instance;