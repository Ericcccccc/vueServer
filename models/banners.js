var mongoose = require('mongoose');
var bannerSchema = new mongoose.Schema({
    "title":String,
    "url": String,
    "src": String,
    "id": String,
    "sum":String
});

module.exports = mongoose.model("Banner", bannerSchema);