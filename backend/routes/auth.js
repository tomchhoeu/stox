// import * as avAPI from '../alphaVantageAPI';
const { getDaily } = require('../alphaVantageAPI');

const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/userController');

const verify = require('../controllers/verify');

// @route   GET auth
// @desc    Test route
// @access  Public
router.get('/', (req, res) => {
  console.log('auth/ called!');
  res.send('Auth route');

  // Temp Stuff
  // const test_func = async function () {
  //   const apiTest = await getDaily('GME');
  //   console.log(apiTest);
  // };
  // test_func();
});

// @route   POST auth/register
// @desc    Registers a user
// @access  Public
// @return  token
router.post('/register', user_controller.createUser);

// @route   POST auth/login
// @desc    Logs in an existing user
// @access  Public
// @return  token
router.post('/login', user_controller.findUser);

// @route   POST auth/logout
// @desc    Logs out a user with a valid token
// @access  Private
router.post('/logout', verify, (req, res) => {
  console.log('auth/logout route called!');
  res.send(200).json('Success!');
});

// @route   Post auth/email
// @desc    Gets a user's email with a valid token
// @access  Private
router.post('/email', verify, user_controller.findEmail);

// @route   Post auth/update
// @desc    Updates an existing user's information
// @access  Private
router.post('/update', verify, user_controller.updateAccount);

module.exports = router;
