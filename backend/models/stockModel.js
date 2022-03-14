// Importing mongoose
const mongoose = require('mongoose');

// Defining schema
const Schema = mongoose.Schema;

const stockSchema = new Schema(
  {
    functionString: String,
    equitySymbol: String,
    optionalParams: String,
    information: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('stockModel', stockSchema);
