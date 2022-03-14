// import mongoose
const mongoose = require('mongoose');

// define schema
const Schema = mongoose.Schema;

const trendingStockSchema = new Schema({
  equitySymbol: String,
  trendingScore: Number,
});

// export schema
module.exports = mongoose.model('trendingStockModel', trendingStockSchema);
