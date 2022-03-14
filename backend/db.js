const mongoose = require('mongoose');
const { MONGO_URI } = require('./keys');

// Setting up Uri
const uri = MONGO_URI;

// Setting up options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connecting to database
mongoose.connect(uri, options).then(
  () => {
    console.log('Database connection established');
  },
  (err) => {
    {
      console.log('Database connection error:', err);
    }
  }
);
