// Importing mongoose
const mongoose = require('mongoose');

// Defining shcema
const Schema = mongoose.Schema;

const savedStock = new Schema({
  equitySymbol: String,
  amount: Number,
  buyPrice: Number,
  dateObtained: String,
});

const portfolioSchema = new Schema({
  name: String,
  stocks: [savedStock],
});

// Exporting schema
module.exports = mongoose.model('portfolioModel', portfolioSchema);
