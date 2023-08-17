const { MongoClient } = require("mongodb");

const connection_string = process.env.DB_CONNECTION_URI || "";

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(connection_string)
    .then((client) => {
      console.log("Connection Successful");
      // console.log(client)
      _db = client.db();
      //   console.log(_db);
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    // console.log(_db);
    return _db;
  }
  throw "No database found!";
};

exports.getDb = getDb;
exports.mongoConnect = mongoConnect;

// const client = new MongoClient(connection_string);

// const connectToDB = async(db,collec) => {
//     let collection,connection;
//     try{
//         connection = await client.connect();
//         console.log('Connection established');
//         collection = connection.db(db);
//         // collection = connection.db(db).collection(collec);
//     }catch(error){
//         console.error(error.message);
//     }
//     return collection;
// }

// module.exports = connectToDB;
