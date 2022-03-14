const mongoose = require('mongoose');

// Defining shcema
const Schema = mongoose.Schema;

const savedStock = new Schema({
  equitySymbol: String,
  amount: Number,
  buyPrice: Number,
  dateObtained: String,
});

// Exporting schema
module.exports = mongoose.model('portfolioModelStock', savedStock);
