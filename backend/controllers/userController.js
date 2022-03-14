const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

// Import model
const User = require('../models/userModel');
const Portfolio = require('../models/portfolioModel');
const Watchlist = require('../models/watchlistModel');
const PortfolioStock = require('../models/portfolioStockModel');
const WatchlistStock = require('../models/watchlistStockModel');
const config = require('./config');
const TOKEN_KEY = config.key;

const {
  getDaily,
  getQuoteEndpoint,
  getIntraday,
  getSearchEndpoint,
} = require('../alphaVantageAPI');

/*
========================
User related functions
========================
*/

/**
 * (Register)
 * Creates a new user given a unique email address and password
 */
exports.createUser = (req, res) => {
  let user = new User(req.body);
  const { email, password } = req.body;
  if (password == '') {
    return res.status(400).json('Please fill out the password field!');
  }
  // Encrypting the password before adding the password to the database
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  user.password = hash;
  console.log(
    'Recieved register request with email and password: ',
    email,
    password
  );
  // Creates a token using user_id and email that expires in 8 hours
  const token = jwt.sign({ user_id: user._id, email }, TOKEN_KEY, {
    expiresIn: '8h',
  });
  req.token = token;
  console.log(token);
  const payload = token;
  User.findOne({ email: email }, (err, result) => {
    // Check if email is already registered
    if (err) {
      return res.status(500).json('Error accessing database');
    }
    if (result) {
      return res.status(403).json('Email already exists!');
    } else {
      // Save new user
      user.save();
      console.log('Saved user');
      return res.status(200).json(payload);
      //return res.status(400).json(payload); // hardcoded just to test error notif on frontend
    }
  });
};

/**
 * (Login)
 * Checks if email address and password matches
 */
exports.findUser = (req, res) => {
  const { email, password } = req.body;
  // Find user with matching email and password
  User.findOne({ email: email }, (err, result) => {
    if (err) {
      return res.status(500).json('Error accessing database');
    }
    if (result) {
      // Check if password matches encrypted password in database
      const check = bcrypt.compareSync(password, result.password);
      if (check) {
        const token = jwt.sign({ user_id: result._id, email }, TOKEN_KEY, {
          expiresIn: '8h',
        });
        req.token = token;
        const payload = token;
        console.log(result);
        return res.status(200).json(payload);
      }
    }
    console.log('Incorrect email, password combination');
    return res.status(401).json('Incorrect email, password combination');
  });
};

exports.findEmail = (req, res) => {
  const token = req.body.token;
  const email = jwt.verify(token, TOKEN_KEY)['email'];
  const payload = {
    email,
  };
  return res.status(200).json(payload);
};

exports.updateAccount = (req, res) => {
  const token = req.body.token;
  const email = req.body.email;
  const verified = jwt.verify(token, TOKEN_KEY);
  const old_email = verified['email'];
  console.log('Setting email to', email);
  if (email == old_email) {
    return updateAccountHelper(req, res);
  }
  User.findOne({ email: email }, (err, result) => {
    // Check if email is already registered
    if (err) {
      return res.status(500).json('Error accessing database');
    }
    if (result) {
      return res.status(403).json('Email already exists!');
    } else {
      return updateAccountHelper(req, res);
    }
  });
};

const updateAccountHelper = (req, res) => {
  const token = req.body.token;
  const email = req.body.email;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  if (req.body.password == '') {
    console.log('No password');
    User.findByIdAndUpdate(id, { $set: { email: email } }, (err, result) => {
      if (err) {
        return res.status(500).json('Error Accessing database');
      }
      if (result) {
        const token = jwt.sign({ user_id: id, email }, TOKEN_KEY, {
          expiresIn: '8h',
        });
        const payload = {
          token,
        };
        return res.status(200).json(payload);
      }
    });
  } else {
    console.log('There password');
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(req.body.password, salt);
    User.findByIdAndUpdate(
      id,
      { $set: { email: email, password: password } },
      (err, result) => {
        if (err) {
          return res.status(500).json('Error Accessing database');
        }
        if (result) {
          const token = jwt.sign({ user_id: id, email }, TOKEN_KEY, {
            expiresIn: '8h',
          });
          const payload = {
            token,
          };
          return res.status(200).json(payload);
        }
      }
    );
  }
};
