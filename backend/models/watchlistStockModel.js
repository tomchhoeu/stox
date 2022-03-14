// Importing mongoose
const mongoose = require('mongoose');

// Defining shcema
const Schema = mongoose.Schema;

const watchedStock = new Schema({
  equitySymbol: String,
  dateAdded: String,
});

// Exporting schema
module.exports = mongoose.model('watchlistStockModel', watchedStock);
