const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const TOKEN_KEY = '1234';

const verifyToken = (req, res, next) => {
  console.log('Beginning verification process...');
  const token = req.body.token || req.params.token;

  if (!token) {
    console.log(token);
    return res.status(403).json('Token is not provided');
  }
  try {
    const decoded = jwt.verify(token, TOKEN_KEY);
    const { email, user_id } = decoded;
    User.findOne({ email: email, _id: user_id }, (err, result) => {
      // Check if email has been registered
      if (err) {
        return res.status(500).json('Error accessing database!');
      }
      if (result) {
        console.log('Corresponding account found in database!');
        return next();
      } else {
        return res
          .status(403)
          .json('Token does not match account in database!');
      }
    });
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json('Token has expired. Try logging out and logging in!');
  }
};

module.exports = verifyToken;
