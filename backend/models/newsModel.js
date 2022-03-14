// Importing mongoose
const mongoose = require('mongoose');

// Defining shcema
const Schema = mongoose.Schema;

const newsSchema = new Schema({
  source: String,
  title: String,
  description: String,
  body: String,
  url: String,
  date: Date,
});

// Exporting schema
module.exports = mongoose.model('newsModel', newsSchema);
