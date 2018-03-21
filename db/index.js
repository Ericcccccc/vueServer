var mongoose = require('mongoose');

var dbUrl = 'mongodb://127.0.0.1:27017/db_demo'
var db = {};

db.createConnection = ()=>{
    //连接MongoDB数据库
    mongoose.connect(dbUrl);

    mongoose.connection.on("connected", function () {
        console.log("MongoDB connected success.")
    });

    mongoose.connection.on("error", function () {
        console.log("MongoDB connected fail.")
    });

    mongoose.connection.on("disconnected", function () {
        console.log("MongoDB connected disconnected.")
    });

}
module.exports = db;