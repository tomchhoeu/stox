// Importing mongoose
const mongoose = require('mongoose');

// Defining schema
const Schema = mongoose.Schema;

const watchedStock = new Schema({
  equitySymbol: String,
  dateAdded: String,
});

const watchlistSchema = new Schema({
  name: String,
  stocks: [watchedStock],
});

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

const userSchema = new Schema({
  email: String,
  password: String,
  portfolios: [portfolioSchema],
  watchlists: [watchlistSchema],
});

// Exporting schema
module.exports = mongoose.model('userModel', userSchema);
