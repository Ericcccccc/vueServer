var mongoose = require('mongoose');
var adminSchema = new mongoose.Schema({
    "adminName":String,
    "adminPwd":String,
    "authority":Number
});

module.exports = mongoose.model("Admin",adminSchema);