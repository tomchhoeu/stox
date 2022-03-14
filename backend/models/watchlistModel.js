// Importing mongoose
const mongoose = require('mongoose');

// Defining shcema
const Schema = mongoose.Schema;

const watchedStock = new Schema({
  equitySymbol: String,
  dateAdded: String,
});

const watchlistSchema = new Schema({
  name: String,
  stocks: [watchedStock],
});

// Exporting schema
module.exports = mongoose.model('watchlistModel', watchlistSchema);
